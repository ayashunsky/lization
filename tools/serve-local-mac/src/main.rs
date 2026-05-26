use std::env;
use std::fs;
use std::io::{self, BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Component, Path, PathBuf};
use std::sync::Arc;
use std::thread;

fn main() {
    if let Err(error) = run() {
        eprintln!("{error}");
        std::process::exit(1);
    }
}

fn run() -> Result<(), String> {
    let config = Config::from_args(env::args().skip(1))?;

    if !config.root.is_dir() {
        return Err(format!(
            "Game directory does not exist or is not a directory: {}",
            config.root.display()
        ));
    }

    let listener = match TcpListener::bind((config.host.as_str(), config.port)) {
        Ok(listener) => listener,
        Err(error) if error.kind() == io::ErrorKind::AddrInUse => {
            println!(
                "Server already running or port {} is busy at http://{}:{}/",
                config.port, config.host, config.port
            );
            return Ok(());
        }
        Err(error) => {
            return Err(format!(
                "Failed to bind http://{}:{}/: {}",
                config.host, config.port, error
            ));
        }
    };

    println!(
        "Serving {} at http://{}:{}/",
        config.root.display(),
        config.host,
        config.port
    );

    let shared_root = Arc::new(config.root);

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                let root = Arc::clone(&shared_root);
                thread::spawn(move || {
                    if let Err(error) = handle_connection(stream, &root) {
                        eprintln!("Request handling error: {error}");
                    }
                });
            }
            Err(error) => {
                eprintln!("Connection accept error: {error}");
            }
        }
    }

    Ok(())
}

struct Config {
    host: String,
    port: u16,
    root: PathBuf,
}

impl Config {
    fn from_args<I>(args: I) -> Result<Self, String>
    where
        I: IntoIterator<Item = String>,
    {
        let mut host = String::from("127.0.0.1");
        let mut port = 8765u16;
        let mut root = env::current_dir()
            .map_err(|error| format!("Failed to get current directory: {error}"))?;

        let mut pending_flag: Option<String> = None;

        for arg in args {
            if let Some(flag) = pending_flag.take() {
                match flag.as_str() {
                    "--host" => host = arg,
                    "--port" => {
                        port = arg
                            .parse::<u16>()
                            .map_err(|_| format!("Invalid port value: {arg}"))?
                    }
                    "--root" => root = PathBuf::from(arg),
                    _ => return Err(format!("Unsupported flag: {flag}")),
                }
                continue;
            }

            match arg.as_str() {
                "--host" | "--port" | "--root" => pending_flag = Some(arg),
                "--help" | "-h" => {
                    print_help();
                    std::process::exit(0);
                }
                _ => return Err(format!("Unsupported argument: {arg}")),
            }
        }

        if let Some(flag) = pending_flag {
            return Err(format!("Missing value for {flag}"));
        }

        Ok(Self { host, port, root })
    }
}

fn print_help() {
    println!(
        "Usage: serve-local-linux [--host <host>] [--port <port>] [--root <directory>]\n\
         Defaults: --host 127.0.0.1 --port 8765 --root <current-directory>"
    );
}

fn handle_connection(mut stream: TcpStream, root: &Path) -> io::Result<()> {
    let mut reader = BufReader::new(stream.try_clone()?);
    let request_line = read_request_line(&mut reader)?;

    if request_line.is_empty() {
        return Ok(());
    }

    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("");
    let target = parts.next().unwrap_or("/");

    drain_headers(&mut reader)?;

    match method {
        "GET" | "HEAD" => serve_path(&mut stream, root, target, method == "HEAD"),
        _ => respond_text(
            &mut stream,
            405,
            "Method Not Allowed",
            "Only GET and HEAD are supported.\n",
            method == "HEAD",
        ),
    }
}

fn read_request_line(reader: &mut BufReader<TcpStream>) -> io::Result<String> {
    let mut line = String::new();
    reader.read_line(&mut line)?;
    Ok(line.trim_end_matches(['\r', '\n']).to_string())
}

fn drain_headers(reader: &mut BufReader<TcpStream>) -> io::Result<()> {
    loop {
        let mut line = String::new();
        let read = reader.read_line(&mut line)?;
        if read == 0 || line == "\r\n" || line == "\n" {
            return Ok(());
        }
    }
}

fn serve_path(stream: &mut TcpStream, root: &Path, target: &str, head_only: bool) -> io::Result<()> {
    let request_path = target.split(['?', '#']).next().unwrap_or("/");
    let decoded = percent_decode(request_path)
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "Invalid percent encoding"))?;
    let safe_relative = sanitize_relative_path(&decoded)
        .ok_or_else(|| io::Error::new(io::ErrorKind::PermissionDenied, "Path traversal blocked"))?;

    let mut full_path = root.join(&safe_relative);

    if full_path.is_dir() {
        full_path = full_path.join("index.html");
    } else if decoded == "/" {
        full_path = root.join("index.html");
    }

    if !full_path.exists() || !full_path.is_file() {
        return respond_text(stream, 404, "Not Found", "404 Not Found\n", head_only);
    }

    let body = fs::read(&full_path)?;
    let content_type = content_type_for_path(&full_path);
    respond_bytes(stream, 200, "OK", content_type, &body, head_only)
}

fn respond_text(
    stream: &mut TcpStream,
    status: u16,
    status_text: &str,
    body: &str,
    head_only: bool,
) -> io::Result<()> {
    respond_bytes(stream, status, status_text, "text/plain; charset=utf-8", body.as_bytes(), head_only)
}

fn respond_bytes(
    stream: &mut TcpStream,
    status: u16,
    status_text: &str,
    content_type: &str,
    body: &[u8],
    head_only: bool,
) -> io::Result<()> {
    write!(
        stream,
        "HTTP/1.1 {} {}\r\n\
         Content-Length: {}\r\n\
         Content-Type: {}\r\n\
         Cache-Control: no-store\r\n\
         Connection: close\r\n\
         \r\n",
        status,
        status_text,
        body.len(),
        content_type,
    )?;

    if !head_only {
        stream.write_all(body)?;
    }

    stream.flush()
}

fn sanitize_relative_path(request_path: &str) -> Option<PathBuf> {
    let path = if request_path == "/" {
        PathBuf::new()
    } else {
        PathBuf::from(request_path.trim_start_matches('/'))
    };

    let mut safe = PathBuf::new();

    for component in path.components() {
        match component {
            Component::Normal(part) => safe.push(part),
            Component::CurDir => {}
            Component::RootDir => {}
            Component::ParentDir | Component::Prefix(_) => return None,
        }
    }

    Some(safe)
}

fn percent_decode(input: &str) -> Option<String> {
    let bytes = input.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0usize;

    while index < bytes.len() {
        match bytes[index] {
            b'%' if index + 2 < bytes.len() => {
                let hi = hex_value(bytes[index + 1])?;
                let lo = hex_value(bytes[index + 2])?;
                output.push((hi << 4) | lo);
                index += 3;
            }
            b'%' => return None,
            b'+' => {
                output.push(b' ');
                index += 1;
            }
            byte => {
                output.push(byte);
                index += 1;
            }
        }
    }

    String::from_utf8(output).ok()
}

fn hex_value(byte: u8) -> Option<u8> {
    match byte {
        b'0'..=b'9' => Some(byte - b'0'),
        b'a'..=b'f' => Some(byte - b'a' + 10),
        b'A'..=b'F' => Some(byte - b'A' + 10),
        _ => None,
    }
}

fn content_type_for_path(path: &Path) -> &'static str {
    match path.extension().and_then(|extension| extension.to_str()) {
        Some("html") => "text/html; charset=utf-8",
        Some("css") => "text/css; charset=utf-8",
        Some("js") => "application/javascript; charset=utf-8",
        Some("json") => "application/json; charset=utf-8",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("svg") => "image/svg+xml",
        Some("ico") => "image/x-icon",
        Some("woff") => "font/woff",
        Some("woff2") => "font/woff2",
        Some("ttf") => "font/ttf",
        Some("otf") => "font/otf",
        Some("txt") => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

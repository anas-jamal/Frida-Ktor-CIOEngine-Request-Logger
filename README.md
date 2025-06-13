# Frida Ktor CIOEngine Request Logger

A Frida script for dynamically intercepting and logging outgoing HTTP requests made using `io.ktor.client.engine.cio.CIOEngine` in Android apps.

## Features
- Logs request URL, HTTP method, headers, and body
- Pretty-prints JSON request bodies
- ANSI color-coded terminal output for easy readability
- Handles missing fields gracefully

## Use Case
Perfect for reverse engineering and dynamic analysis of Android apps that use Ktor as their networking client.

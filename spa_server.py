import http.server
import socketserver
import os

PORT = 8001
DIRECTORY = "sports-club-app/dist/sports-club-app/browser"

class SPAHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # If the request is for a path that doesn't exist, serve index.html
        if not os.path.exists(self.translate_path(self.path)):
            self.path = 'index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Create a handler that serves files from the specified directory
handler = lambda *args, **kwargs: SPAHttpRequestHandler(*args, directory=DIRECTORY, **kwargs)

with socketserver.TCPServer(("", PORT), handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()

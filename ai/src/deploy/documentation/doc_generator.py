import json
import pathlib
import requests


class DocGenerator:
    def __init__(
        self,
        swagger_path: str = "http://127.0.0.1:3000/enervi/swagger.json",
        root_dir: pathlib.Path = pathlib.Path(__file__).parent,
    ):
        self.swagger_path = swagger_path
        self.json_path = root_dir / "swagger.json"
        self.html_path = root_dir / "doc.html"

    def update_documentation(self):
        """Write a static html documentation from the swagger json."""
        self.request_swagger_ui_json()
        self.json_to_html()

    def request_swagger_ui_json(self):
        """
        Fetches the Swagger JSON from the API and saves it to a file.
        Make sure that the flask server is running for this one.
        """
        try:
            response = requests.get(self.swagger_path)

            if response.status_code == 200:
                with open(self.json_path, "wb") as json_file:
                    json_file.write(response.content)
                print(f"Swagger JSON saved to {self.json_path}")
            else:
                print(
                    f"Failed to fetch Swagger JSON. Status code: {response.status_code}"
                )
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")

    def json_to_html(self):
        """
        Converts a Swagger JSON file to an HTML rendered according to the swagger UI.
        https://gist.github.com/oseiskar/dbd51a3727fc96dcf5ed189fca491fb3
        """
        with open(self.json_path, "r") as json_file:
            swagger_data = json.load(json_file)

        TEMPLATE = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Swagger UI</title>
          <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700|Source+Code+Pro:300,600|Titillium+Web:400,600,700" rel="stylesheet">
          <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/3.24.2/swagger-ui.css" >
          <style>
            html
            {
              box-sizing: border-box;
              overflow-x: hidden;
              overflow-y: scroll;
            }
            *,
            *:before,
            *:after
            {
              box-sizing: inherit;
            }
            body {
              margin:0;
              background: #fafafa;
            }
          </style>
        </head>
        <body>
        <div id="swagger-ui"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/3.24.2/swagger-ui-bundle.js"> </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/3.24.2/swagger-ui-standalone-preset.js"> </script>
        <script>
        window.onload = function() {
          var spec = %s;
          // Build a system
          const ui = SwaggerUIBundle({
            spec: spec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
          })
          window.ui = ui
        }
        </script>
        </body>
        </html>
        """

        with open(self.html_path, "w") as html_file:
            html_file.write(TEMPLATE % json.dumps(swagger_data))

        print(f"Swagger HTML saved to {self.html_path}")


if __name__ == "__main__":
    doc_generator = DocGenerator()
    doc_generator.update_documentation()

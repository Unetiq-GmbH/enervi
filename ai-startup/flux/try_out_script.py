import base64

from pathlib import Path

from flux import main


if __name__ == "__main__":
    source_path = Path(__file__).parents[1] / "imaginepro/example_images/DJI_0853-HDR-1150x862.jpg"
    results_path = Path(__file__).parents[1] / "imaginepro/example_results"

    # Read the image and encode it to base64
    with source_path.open("rb") as image_file:
        image_b64 = base64.b64encode(image_file.read()).decode('utf-8')

    # Main function call
    adapted_image = main(image_b64, "flux_solar", None, None)

    # Decode the base64 string back to binary data
    adapted_image_data = base64.b64decode(adapted_image)

    # Define the output file path
    output_path = results_path / source_path.name

    # Write the binary data to the output file
    with output_path.open("wb") as output_file:
        output_file.write(adapted_image_data)

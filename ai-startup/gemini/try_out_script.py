import PIL.Image

from gemini import pil_to_b64, b64_to_pil, main

if __name__ == "__main__":
    image = PIL.Image.open("./example_images/example_image.jpg")
    visualization_type = "solar"

    img_b64 = pil_to_b64(image)
    adapted_b64_image = main(
        input_img_b64=img_b64,
        visualization_type=visualization_type
    )

    adapted_image = b64_to_pil(adapted_b64_image)

    adapted_image.save(f"{visualization_type}.png")

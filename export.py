import torch
from model import DualStreamEyewitnessModel
def export_onnx():
    device = torch.device("cpu")
    model = DualStreamEyewitnessModel().to(device)
    model.load_state_dict(torch.load("best_model.pth", map_location=device))
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224, device=device)
    torch.onnx.export(
        model,
        dummy_input,
        "eyewitness_v1.onnx",
        export_params=True,
        opset_version=14,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}
    )
    print("Successfully exported eyewitness_v1.onnx for Spring Boot backend.")
if __name__ == "__main__":
    export_onnx()
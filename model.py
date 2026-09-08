import torch
import torch.nn as nn
from torchvision.models import efficientnet_b4, EfficientNet_B4_Weights
from transformers import CLIPVisionModel
class DualStreamEyewitnessModel(nn.Module):
    def __init__(self):
        super(DualStreamEyewitnessModel, self).__init__()
        # Stream 1: EfficientNet (Local Physical Anomalies)
        self.cnn = efficientnet_b4(weights=EfficientNet_B4_Weights.DEFAULT)
        self.cnn_features = nn.Sequential(*list(self.cnn.children())[:-1]) 
        # Stream 2: CLIP ViT (Global Semantic Logic)
        self.vit = CLIPVisionModel.from_pretrained("openai/clip-vit-base-patch32")
        # Fusion Head: Combine features (1792 from EfficientNet + 768 from CLIP)
        self.fusion = nn.Sequential(
            nn.Linear(1792 + 768, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 2)
        )
    def forward(self, images):
        cnn_out = self.cnn_features(images)
        cnn_out = torch.flatten(cnn_out, 1)
        vit_out = self.vit(pixel_values=images).pooler_output
        combined_features = torch.cat((cnn_out, vit_out), dim=1)
        output = self.fusion(combined_features)
        return output
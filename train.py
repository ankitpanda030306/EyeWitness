import os
import torch
import torch.nn as nn
from torch.optim import Adam
from torch.amp import autocast, GradScaler
from tqdm import tqdm
from model import DualStreamEyewitnessModel
from dataset import get_dataloader

# Prevent CUDA memory fragmentation
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Clear cached GPU memory
    torch.cuda.empty_cache()

    model = DualStreamEyewitnessModel().to(device)

    # Freeze CLIP vision transformer weights
    for param in model.vit.parameters():
        param.requires_grad = False

    # Optimize only trainable layers
    trainable_params = filter(lambda p: p.requires_grad, model.parameters())
    optimizer = Adam(trainable_params, lr=1e-4)
    criterion = nn.CrossEntropyLoss()

    # Mixed precision scaler (cuts VRAM usage in half)
    scaler = GradScaler('cuda')

    # Batch size of 8 fits safely inside 6GB VRAM
    train_loader = get_dataloader(data_dir="data", batch_size=8)

    epochs = 1
    for epoch in range(epochs):
        model.train()
        running_loss, correct, total = 0.0, 0, 0
        
        loop = tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs}")
        for images, labels in loop:
            images, labels = images.to(device, non_blocking=True), labels.to(device, non_blocking=True)

            optimizer.zero_grad(set_to_none=True)

            # Mixed-precision forward pass
            with autocast('cuda'):
                outputs = model(images)
                loss = criterion(outputs, labels)

            # Scaled backward pass
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

            loop.set_postfix(loss=loss.item())

        print(f"Epoch {epoch+1} Complete | Loss: {running_loss/total:.4f} | Acc: {correct/total:.4f}")

    torch.save(model.state_dict(), "best_model.pth")
    print("Training finished. Saved model to best_model.pth")

if __name__ == "__main__":
    train()
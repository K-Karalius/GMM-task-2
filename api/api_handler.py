from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import torch
import torchvision.transforms as transforms
import torch.nn as nn

app = Flask(__name__)
CORS(app)

class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()

        self.conv_stack = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Flatten(),
            nn.Linear(32 * 56 * 56, 512),
            nn.ReLU(),
            nn.Linear(512, 3)
        )

    def forward(self, x):
        return self.conv_stack(x)


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()          
])

classes = ["Car", "Tree", "Sink"]

model = NeuralNetwork()
model.load_state_dict(torch.load('trained_model.pth'))
model.eval()

def evaluate(model, image_bytes, classes, transform):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image = transform(image)
    image = image.unsqueeze(0)
    
    with torch.inference_mode():
      outputs = model(image)
      _, predicted_output = torch.max(outputs, 1)
    
      predicted_class = classes[predicted_output.item()]

      return predicted_class
      
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    
    image_bytes = image_file.read()

    predicted_class = evaluate(model, image_bytes, classes, transform)
    
    return jsonify({'predicted_class': predicted_class})
  
@app.route('/classes', methods=['GET'])
def get_classes():
    return jsonify({'classes': classes})

if __name__ == '__main__':
    app.run(debug=True)
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import numpy as np

class SemanticChecker:
    """
    Evaluates the semantic difference between two images using OpenAI's CLIP embeddings.
    If the cosine similarity is below a given threshold, the scenes are deemed "different"
    computationally, avoiding unnecessary caption generation for static/redundant scenes.
    """
    def __init__(self, model_name="openai/clip-vit-base-patch32", device=None):
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
            
        print(f"Loading SemanticChecker ({model_name}) on {self.device}...")
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.model.eval()
        print("SemanticChecker loaded successfully.")

    def get_embedding(self, image: Image.Image) -> torch.Tensor:
        """
        Generates a normalized semantic feature vector (embedding) for a PIL Image.
        """
        # Ensure image is in RGB format (CV2 passes BGR originally, so this is handled upstream)
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            image_features = self.model.get_image_features(**inputs)
            
        # Normalize the embedding vector for cosine similarity
        image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
        return image_features
        
    def is_semantically_different(self, emb_a: torch.Tensor, emb_b: torch.Tensor, threshold: float = 0.95) -> bool:
        """
        Calculates cosine similarity between two embeddings.
        Returns True if similarity < threshold, indicating semantic difference.
        
        A threshold between 0.92 and 0.98 is typically ideal depending on the leniency 
        desired (higher threshold = more sensitive to changes).
        """
        if emb_a is None or emb_b is None:
            return True # Always different if one is missing

        # Calculate cosine similarity (dot product of normalized vectors)
        cosine_similarity = torch.nn.functional.cosine_similarity(emb_a, emb_b).item()
        
        # If similarity is lower than threshold, they are sufficiently different
        return cosine_similarity < threshold

# Simple self-test
if __name__ == "__main__":
    checker = SemanticChecker()
    img1 = Image.new('RGB', (224, 224), color = 'red')
    img2 = Image.new('RGB', (224, 224), color = 'blue')
    
    emb1 = checker.get_embedding(img1)
    emb2 = checker.get_embedding(img2)
    
    # Same image
    print(f"Similarity red to red: {torch.nn.functional.cosine_similarity(emb1, emb1).item():.4f}")
    
    # Different images
    sim = torch.nn.functional.cosine_similarity(emb1, emb2).item()
    print(f"Similarity red to blue: {sim:.4f}")
    print(f"Is Different (Threshold 0.95)? {checker.is_semantically_different(emb1, emb2, 0.95)}")

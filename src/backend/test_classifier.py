import unittest
from classifier import DangerClassifier

class TestDangerClassifier(unittest.TestCase):
    def setUp(self):
        self.classifier = DangerClassifier(window_size=5)

    def test_safe_text(self):
        result, _ = self.classifier.classify("A beautiful sunny day at the park")
        self.assertEqual(result, "SAFE")

    def test_simple_danger(self):
        result, _ = self.classifier.classify("A large fire near the building")
        self.assertEqual(result, "DANGEROUS")
        
        result, _ = self.classifier.classify("Be careful of the puddle")
        self.assertEqual(result, "DANGEROUS")

    def test_negated_danger(self):
        # Using basic negation words
        result, _ = self.classifier.classify("Road without puddles")
        self.assertEqual(result, "SAFE")
        
        result, _ = self.classifier.classify("There are no holes here")
        self.assertEqual(result, "SAFE")
        
        result, _ = self.classifier.classify("A clean space, zero debris")
        self.assertEqual(result, "SAFE")

    def test_phrasal_negation(self):
        # Testing phrases like "free of" and "clear of"
        result, _ = self.classifier.classify("Clear road, free of obstacles")
        self.assertEqual(result, "SAFE")
        
        result, _ = self.classifier.classify("Path is clear of glass")
        self.assertEqual(result, "SAFE")

    def test_danger_outside_window(self):
        # If the negation is too far away, it should still be marked DANGEROUS
        # Note: "not" is at index 1, "hole" is at index 8 (7 words apart)
        result, _ = self.classifier.classify("I am not sure if there is a hole here")
        self.assertEqual(result, "DANGEROUS")

    def test_multiple_dangers_one_negated(self):
        # "no fire" is safe, but "puddle" is dangerous
        result, reason = self.classifier.classify("There is no fire, but there is a puddle")
        self.assertEqual(result, "DANGEROUS")
        self.assertIn("puddle", reason.lower())

if __name__ == "__main__":
    unittest.main()

# Plan: Migrate to A7med-Ame3/blip2 Model

This change aims to replace the current `Salesforce/blip-image-captioning-base` model with `A7med-Ame3/blip2`. Since `A7med-Ame3/blip2` uses the BLIP-2 architecture, we also need to update the `transformers` imports in the python code.

## User Review Required
Please review and confirm that swapping to the BLIP-2 architecture (`Blip2Processor`, `Blip2ForConditionalGeneration`) is correct and that the HuggingFace backend will support these changes.

## Proposed Changes

### Backend and Inference Node
#### [MODIFY] src/backend/captioner.py
- Change `self.model_name` from `"Salesforce/blip-image-captioning-base"` to `"A7med-Ame3/blip2"`.
- Update `transformers` import to: `from transformers import Blip2Processor, Blip2ForConditionalGeneration`.
- Update the instantiation logic to use `Blip2Processor` and `Blip2ForConditionalGeneration` instead of the original `Blip` variants.

#### [MODIFY] hf_space_api/app.py
- Change `model_name` from `"Salesforce/blip-image-captioning-base"` to `"A7med-Ame3/blip2"`.
- Update `transformers` import to: `from transformers import Blip2Processor, Blip2ForConditionalGeneration`.
- Update `load_model()` to instantiate the new `Blip2` classes.

### Documentation
#### [MODIFY] README.md
- Replace all references of `"Salesforce/blip-image-captioning-base"` with `"A7med-Ame3/blip2"`.
- Change references of `"BLIP-Base"` to `"BLIP-2"`.

## Verification Plan

### Automated Tests
- Run `python src/backend/captioner.py` which contains a self-test at the bottom to ensure the local instantiation and processing pipeline resolves cleanly without crashes using the `A7med-Ame3/blip2` architecture.

### Manual Verification
- Deploying the `hf_space_api/` updates to the Hugging Face Docker Space to ensure it builds correctly.
- Triggering the API directly to verify the output format hasn't unexpectedly changed.

from flask import Flask, request, jsonify
from transformers import BertTokenizerFast, EncoderDecoderModel
import torch
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
tokenizer = BertTokenizerFast.from_pretrained('mrm8488/bert-small2bert-small-finetuned-cnn_daily_mail-summarization')
model = EncoderDecoderModel.from_pretrained('mrm8488/bert-small2bert-small-finetuned-cnn_daily_mail-summarization').to(device)

def generate_summary_with_min_length(text):
    inputs = tokenizer([text], padding="max_length", truncation=True, max_length=512, return_tensors="pt")
    input_ids = inputs.input_ids.to(device)
    attention_mask = inputs.attention_mask.to(device)

    text_length = len(text.split())
    min_length = max(text_length // 3 , 1)
    output = model.generate(input_ids, attention_mask=attention_mask, min_length=min_length)

    return tokenizer.decode(output[0], skip_special_tokens=True)

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    text = data['text']

    summary = generate_summary_with_min_length(text)
    
    return jsonify({'summary': summary})

if __name__ == '__main__':
    app.run(debug=True, port=6060)

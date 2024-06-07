from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/scrape', methods=['POST'])
def scrape():
    try:
        input_url = request.json.get('url')
        if input_url:
        
            if "tutorialspoint.com" in input_url:
                response = requests.get(input_url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, "html.parser")

                title = soup.find("div", class_="tutorial-content cover")
                title_text = soup.find("h1").get_text()

                article_text = soup.find("div", class_="tutorial-content")
                para = article_text.find_all(["p", "h2", "h3"], recursive=False)
                content = [p.get_text() for p in para if p.name != "pre"]

                result = {
                    'source': 'TutorialsPoint',
                    'title': title_text,
                    'content': content
                }

                return jsonify(result), 200

            elif "geeksforgeeks.org" in input_url:
                response = requests.get(input_url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, "html.parser")

                title = soup.find("h1").get_text()

                article_text = soup.find("div", class_="text")
                para = article_text.find_all(["p", "h2", "h3", "span"], recursive=False)
                content = [p.get_text().replace('âˆ’', '-') for p in para if p.name != "pre"]

                result = {
                    'source': 'GeeksforGeeks',
                    'title': title,
                    'content': content
                }

                return jsonify(result), 200

            else:
                return jsonify({'error': 'Unsupported website. Please enter a valid TutorialsPoint or GeeksforGeeks URL.'}), 400

        else:
            return jsonify({'error': 'Please provide a URL.'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8080)

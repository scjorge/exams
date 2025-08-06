from bs4 import BeautifulSoup
from pprint import pprint
import json


def load_data(file):
    """
    file: recebe um aruivo com a copia da cahve "ol.wpProQuiz_list" do html da página da skillcert
    """
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    quiz_data = []

    # Itera sobre todas as perguntas
    for item in soup.select('ol.wpProQuiz_list > li.wpProQuiz_listItem'):
        # Pergunta
        question_tag = item.select_one('.wpProQuiz_question_text p')
        question_text = question_tag.get_text(strip=True) if question_tag else "Pergunta não encontrada"

        # Tipo da pergunta (single ou multiple)
        question_list_tag = item.select_one('.wpProQuiz_questionList')
        question_type = question_list_tag.get('data-type', 'single') if question_list_tag else 'single'

        # Alternativas e respostas corretas
        choices = []
        correct_answers = []

        for li in item.select('.wpProQuiz_questionListItem'):
            label = li.select_one('label')
            if not label:
                continue

            choice_text = label.get_text(strip=True)
            choices.append(choice_text)

            # Verifica se esta alternativa é uma das corretas
            if 'wpProQuiz_answerCorrect' in li.get('class', []):
                correct_answers.append(choice_text)

        a = {}
        s = ["A", "B", "C", "D", "E", "F", "G", "H"]

        for c, i in zip(choices, s):
            a[i] = c

        ans = ""
        for i in correct_answers:
            for k, v in a.items():
                if i == v:
                    ans += k
        
        for k, v in a.items():
            a[k] = v.strip().replace('"', "")

        quiz_data.append({
            "text": question_text,
            "type": question_type,
            "choices": a,
            "answer": ans,
            "source": "skillcertpro"
        })

    return quiz_data
    #print(json.dumps(quiz_data, indent=2, ensure_ascii=False))


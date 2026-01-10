import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { SurveyDetail } from "@/types/survey";

// Rejestracja czcionki dla polskich znaków (opcjonalne, ale zalecane)
// Możesz tu podać ścieżkę do lokalnego pliku .ttf w public/fonts
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  meta: {
    fontSize: 10,
    color: '#9ca3af',
  },
  questionContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  questionText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#374151',
    fontWeight: 'bold',
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  choiceLabel: {
    width: '40%',
    fontSize: 10,
    color: '#4b5563',
  },
  barContainer: {
    width: '45%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginRight: 10,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4f46e5', // Indigo-600
    borderRadius: 4,
  },
  voteCount: {
    width: '10%',
    fontSize: 10,
    textAlign: 'right',
    color: '#6b7280',
  }
});

type Props = {
  survey: SurveyDetail;
  totalVotes: number;
};

export const SurveyPDF = ({ survey, totalVotes }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>

      {/* Nagłówek */}
      <View style={styles.header}>
        <Text style={styles.title}>{survey.title}</Text>
        <Text style={styles.description}>{survey.description}</Text>
        <Text style={styles.meta}>
          ID: {survey.id} | Suma głosów: {totalVotes} | Link do głosowania: {survey.access_code}
        </Text>
      </View>

      {/* Lista pytań */}
      {survey.questions.map((q, idx) => {
        // Obliczamy max głosów dla pytania, żeby wyskalować paski
        const questionTotal = q.choices.reduce((acc, c) => acc + c.votes, 0);

        return (
          <View key={q.id} style={styles.questionContainer} wrap={false}>
            <Text style={styles.questionText}>
              {idx + 1}. {q.question_text} (Suma głosów: {questionTotal})
            </Text>

            {q.choices.map((c) => {
              // Matematyka paska: szerokość w %
              const percentage = questionTotal > 0 ? (c.votes / questionTotal) * 100 : 0;

              return (
                <View key={c.id} style={styles.choiceRow}>
                  <Text style={styles.choiceLabel}>{c.choice_text}</Text>

                  {/* Pasek wykresu */}
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${percentage}%` }]} />
                  </View>

                  <Text style={styles.voteCount}>{c.votes} gł. ({Math.round(percentage)}%)</Text>
                </View>
              );
            })}
          </View>
        );
      })}

      <Text style={{ position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 10, textAlign: 'center', color: '#9ca3af' }}>
        Wygenerowano przez SurveyPlatform
      </Text>
    </Page>
  </Document>
);
import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'

interface SeedConfirmProps {
  originalSeed: string[]
  onConfirmed: () => void
}

export const SeedConfirm: React.FC<SeedConfirmProps> = ({ originalSeed, onConfirmed }) => {
  const { t } = useI18n()
  const [selectedWords, setSelectedWords] = React.useState<string[]>([])
  const [shuffledWords, setShuffledWords] = React.useState<string[]>([])
  const [wordsToConfirm] = React.useState<number[]>(() => {
    // Select 3 random positions to confirm
    const positions: number[] = []
    while (positions.length < 3) {
      const pos = Math.floor(Math.random() * 12)
      if (!positions.includes(pos)) {
        positions.push(pos)
      }
    }
    return positions.sort((a, b) => a - b)
  })

  React.useEffect(() => {
    // Create shuffled array of all words including the required ones
    const requiredWords = wordsToConfirm.map(pos => originalSeed[pos])
    const otherWords = [
      'apple', 'banana', 'cherry', 'dog', 'elephant', 'forest', 'guitar', 'house', 'island'
    ]
    const allWords = [...requiredWords, ...otherWords]
    setShuffledWords(allWords.sort(() => Math.random() - 0.5))
  }, [originalSeed, wordsToConfirm])

  const handleWordClick = (word: string) => {
    if (selectedWords.length < wordsToConfirm.length && !selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word])
    }
  }

  const handleRemoveWord = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setSelectedWords([])
  }

  const isCorrect = () => {
    return wordsToConfirm.every((pos, index) => selectedWords[index] === originalSeed[pos])
  }

  const canConfirm = selectedWords.length === wordsToConfirm.length && isCorrect()

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-matte-black-900 mb-4">
          {t('auth.seed.confirm_title')}
        </h2>
        <p className="text-matte-black-600">
          {t('auth.seed.confirm_instruction')}
        </p>
      </div>

      {/* Words to confirm */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-matte-black-700 mb-3">
          Selecione as palavras nas posições: {wordsToConfirm.map(pos => pos + 1).join(', ')}
        </h3>
        
        <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-sand-50 rounded-xl border-2 border-dashed border-sand-300">
          {selectedWords.map((word, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleRemoveWord(index)}
              className={`px-3 py-2 rounded-lg font-mono text-sm border-2 transition-colors ${
                selectedWords[index] === originalSeed[wordsToConfirm[index]]
                  ? 'bg-success-100 border-success-300 text-success-800'
                  : 'bg-danger-100 border-danger-300 text-danger-800'
              }`}
            >
              <span className="text-xs mr-2">{wordsToConfirm[index] + 1}.</span>
              {word}
            </motion.button>
          ))}
          {selectedWords.length === 0 && (
            <p className="text-matte-black-400 text-sm">
              Clique nas palavras abaixo para selecioná-las
            </p>
          )}
        </div>
      </div>

      {/* Word options */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2">
          {shuffledWords.map((word, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleWordClick(word)}
              disabled={selectedWords.includes(word)}
              className={`p-3 rounded-lg font-mono text-sm transition-colors ${
                selectedWords.includes(word)
                  ? 'bg-matte-black-100 text-matte-black-400 cursor-not-allowed'
                  : 'bg-white border border-sand-200 hover:border-bazari-red hover:bg-bazari-red-50 text-matte-black-900'
              }`}
            >
              {word}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex-1"
        >
          <RotateCcw size={16} className="mr-2" />
          Resetar
        </Button>
        
        <Button
          onClick={onConfirmed}
          disabled={!canConfirm}
          className="flex-1"
          size="lg"
        >
          {canConfirm && <CheckCircle2 size={16} className="mr-2" />}
          {t('app.actions.confirm')}
        </Button>
      </div>
    </div>
  )
}

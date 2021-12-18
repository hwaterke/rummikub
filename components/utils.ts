import chalk from 'chalk'
import {Color} from './Color'

const DEBUG = false

export type Piece = {
  value: number
  color: Color
}

function debugTile(piece: Piece) {
  switch (piece.color) {
    case Color.BLACK:
      return `${piece.value}`
    case Color.RED:
      return chalk.red(piece.value)
    case Color.YELLOW:
      return chalk.yellow(piece.value)
    case Color.BLUE:
      return chalk.blue(piece.value)
  }
}

// Used in the CLI
export function debugSequence(pieces: Piece[]) {
  console.log(`[${pieces.map(debugTile).join(',')}]`)
}

export function debugSequences(sequences: Piece[][]) {
  console.log(
    ...sequences.map((sequence) => `[${sequence.map(debugTile).join(',')}]`)
  )
}

export const generateAllTiles = () => {
  const pieces: Piece[] = []
  for (let i = 0; i < 2; i++) {
    for (const color of [Color.BLACK, Color.RED, Color.BLUE, Color.YELLOW]) {
      for (const value of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
        pieces.push({
          value,
          color,
        })
      }
    }
  }

  return pieces
}

const last = <T>(list: T[]) => {
  return list[list.length - 1]
}

export const shuffle = <T>(array: T[]) => {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

const canBePlacedOnSequence = (sequence: Piece[], piece: Piece) => {
  // The sequence is empty
  if (sequence.length === 0) {
    return true
  }

  // All same color (force order of colors to reduce exploration) or follows value
  return (
    sequence.every((p) => p.value === piece.value && p.color < piece.color) ||
    (sequence.every((p) => p.color === piece.color) &&
      last(sequence).value + 1 === piece.value)
  )
}

export const sortPieces = <T extends Piece>(pieces: T[]): T[] => {
  const sortedPieces = [...pieces]
  sortedPieces.sort((a, b) => {
    if (a.value === b.value) {
      return a.color - b.color
    }
    return a.value - b.value
  })
  return sortedPieces
}

type AlgoPiece = Piece & {
  fromPlayer: boolean
  placed: boolean
}

function orderedSequences(sequences: Piece[][], piece: AlgoPiece) {
  // Only explore if the piece is bigger or equal to the first of the prev sequence

  // If we are starting a new sequence
  const lastSequence = last(sequences)
  if (sequences.length >= 2 && lastSequence.length === 0) {
    const penSequence = sequences[sequences.length - 2]
    return (
      piece.value >= penSequence[0].value || piece.color >= penSequence[0].color
    )
  }
  return true
}

export const play = async (placedPieces: Piece[], playerPieces: Piece[]) => {
  // Put all pieces together
  let availablePieces: AlgoPiece[] = []
  for (const piece of placedPieces) {
    availablePieces.push({
      ...piece,
      fromPlayer: false,
      placed: false,
    })
  }
  for (const piece of playerPieces) {
    availablePieces.push({
      ...piece,
      fromPlayer: true,
      placed: false,
    })
  }

  // Sort the pieces first by color then by value
  availablePieces = sortPieces(availablePieces)

  const sequences: Piece[][] = [[]]
  let solutionsEnvisaged = 0
  let solutionsEnvisagedOnlyPlayerLeft = 0
  let min = -1
  let recurseCount = 0
  let resultSequences: Piece[][] = []
  let resultPlayerPieces: Piece[] = playerPieces

  if (DEBUG) {
    console.log(availablePieces)
  }

  function recurse(): number {
    recurseCount++
    const currentSequence = last(sequences)

    if (DEBUG) {
      debugSequences(sequences)
      console.log(
        availablePieces.map((piece) => (piece.placed ? 1 : 0)).join(',')
      )
    }

    // Try to place in the current sequence a oiece that has not been placed yet.
    availablePieces.forEach((piece, index) => {
      if (!piece.placed && orderedSequences(sequences, piece)) {
        if (canBePlacedOnSequence(currentSequence, piece)) {
          // Quick test to cut on exploration.
          // As tiles are sorted. Once we reach a value of last tile + 2 we can break out of the loop
          if (
            currentSequence.length > 0 &&
            piece.value > last(currentSequence).value + 1
          ) {
            // No need to go further
            // return
          }

          // If the previous piece was exactly the same, no need to explore it if it is not used yet
          if (
            index > 0 &&
            availablePieces[index].value === availablePieces[index - 1].value &&
            availablePieces[index].color === availablePieces[index - 1].color &&
            !availablePieces[index - 1].placed
          ) {
            return
          }

          currentSequence.push(piece)
          piece.placed = true
          // Recurse and get the result
          const result = recurse()
          if (result !== -1 && (result < min || min === -1)) {
            min = result
            resultSequences = sequences.map((sequence) =>
              sequence.map((piece) => ({
                value: piece.value,
                color: piece.color,
              }))
            )
            resultPlayerPieces = availablePieces
              .filter((piece) => !piece.placed)
              .map((piece) => ({
                value: piece.value,
                color: piece.color,
              }))
          }
          currentSequence.pop()
          piece.placed = false
        }
      }
    })

    if (currentSequence.length >= 3) {
      // New sequence
      sequences.push([])
      // Recurse and get the result
      const result = recurse()
      if (result !== -1 && (result < min || min === -1)) {
        min = result
        resultSequences = sequences.map((sequence) =>
          sequence.map((piece) => ({
            value: piece.value,
            color: piece.color,
          }))
        )
        resultPlayerPieces = availablePieces
          .filter((piece) => !piece.placed)
          .map((piece) => ({
            value: piece.value,
            color: piece.color,
          }))
      }

      sequences.pop()
    }

    // Here return the result !
    if (currentSequence.length < 3) {
      return -1
    }

    solutionsEnvisaged++

    if (availablePieces.some((p) => !p.fromPlayer && !p.placed)) {
      // Some pieces form the tables haven't benn used
      return -1
    }
    // Return number of player pieces left (should be minimum)
    solutionsEnvisagedOnlyPlayerLeft++

    return availablePieces.reduce((acc, v) => acc + (v.placed ? 0 : 1), 0)
  }

  recurse()

  return {
    playerPieces: resultPlayerPieces,
    sequences: resultSequences,
    solutionsEnvisaged,
    solutionsEnvisagedOnlyPlayerLeft,
    recurseCount,
  }
}

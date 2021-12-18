import {Color} from './components/Color'
import {debugSequence, Piece, play} from './components/utils'

const placedPieces: Piece[] = []
const playerPieces: Piece[] = [
  {value: 1, color: Color.BLACK},
  {value: 1, color: Color.BLACK},
  {value: 2, color: Color.BLACK},
  {value: 2, color: Color.BLACK},
  {value: 3, color: Color.BLACK},
  {value: 3, color: Color.BLACK},
  {value: 3, color: Color.BLACK},
  {value: 4, color: Color.BLACK},
  {value: 4, color: Color.BLACK},
  {value: 4, color: Color.BLACK},
  {value: 4, color: Color.BLACK},
  {value: 5, color: Color.BLACK},
  {value: 5, color: Color.BLACK},
  {value: 5, color: Color.BLACK},
  {value: 5, color: Color.BLACK},
  {value: 6, color: Color.BLACK},
  {value: 7, color: Color.BLACK},
  {value: 8, color: Color.BLACK},
  {value: 8, color: Color.BLACK},
  {value: 8, color: Color.BLACK},
  {value: 9, color: Color.BLACK},
  {value: 9, color: Color.BLACK},
  {value: 9, color: Color.BLACK},
  {value: 10, color: Color.BLACK},
  {value: 11, color: Color.BLACK},
  {value: 11, color: Color.BLACK},
  {value: 12, color: Color.BLACK},
  {value: 13, color: Color.BLACK},
]

async function main() {
  const result = await play(placedPieces, playerPieces)
  console.log(result)

  console.log('Table')
  result.sequences.map(debugSequence)

  console.log('Player')
  debugSequence(result.playerPieces)
}

main()

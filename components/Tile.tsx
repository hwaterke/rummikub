import styled from 'styled-components'
import {Color} from './Color'

const colorToRGB = {
  [Color.BLACK]: '#000',
  [Color.RED]: 'rgb(154,22,0)',
  [Color.BLUE]: 'rgb(2,85,90)',
  [Color.YELLOW]: 'rgb(190,119,23)',
}

const TileContainer = styled.div<{tileColor: Color}>`
  width: 45px;
  height: 64px;
  background-color: rgb(220, 203, 160);
  color: ${(props) => colorToRGB[props.tileColor]};
`

type Props = {
  value: number
  color: Color
}

export const Tile = ({value, color}: Props) => {
  return (
    <TileContainer
      tileColor={color}
      className="m-1 inline-flex justify-center border border-gray-500"
    >
      <p className="text-3xl">{value}</p>
    </TileContainer>
  )
}

import React from "react"
import styled from "styled-components"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { Roll } from "shared/models/roll"


interface Props {
  name: string
  id: number
  onClick?: React.MouseEventHandler<HTMLDivElement>
  showAllRoles?: () => void
  roll: Roll

}
export const RollNumberTile: React.FC<Props> = ({ id, name, onClick, showAllRoles, roll }) => {
  return (
    <S.Container
      onClick={onClick}
    >
      <S.Content>
        <div>{name}</div>
      </S.Content>
      {roll?.name?.length > 0 && <div onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        showAllRoles && showAllRoles()
      }}>
        <S.ShowButton>Show All Rolls</S.ShowButton>
      </div>}
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    margin-top: ${Spacing.u3};
    padding-right: ${Spacing.u2};
    display: flex;
    justify-content:space-between;
    align-items:center;
    height: 60px;
    border-radius: ${BorderRadius.default};
    background-color: #fff;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.13);
    transition: box-shadow 0.3s ease-in-out;

    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  ShowButton: styled.div`
    padding-right: ${Spacing.u2};
    display: flex;
    padding:4px;
    border-radius: ${BorderRadius.default};
    background-color: #000;
    color:#fff;
    cursor:pointer;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.13);
    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  Content: styled.div`
    flex-grow: 1;
    padding: ${Spacing.u2};
    display: flex;
    color: ${Colors.dark.base};
    font-weight: ${FontWeight.strong};
    cursor:pointer;
  `,
}

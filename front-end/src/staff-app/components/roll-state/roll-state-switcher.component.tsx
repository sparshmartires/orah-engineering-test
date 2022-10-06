import React, { useState } from "react"
import { RolllStateType } from "shared/models/roll"
import { Person } from "shared/models/person"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType) => void
  id: number
  users?: Person[]
  setUsers?: (value: Person[]
    | undefined) => void,
  disableStateChange?: boolean
}

export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, onStateChange, setUsers, id, users, disableStateChange = false }) => {
  const [rollState, setRollState] = useState(initialState)

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState()
    const newState = users?.map(obj => {
      if (obj.id === id) {
        return { ...obj, roll_call: next }
      }
      return obj
    })
    setUsers && setUsers(newState)
    setRollState(next)
    if (onStateChange) {
      onStateChange(next)
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={() => {
    if (disableStateChange) {
      return
    }
    onClick()
  }
  } />
}

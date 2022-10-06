import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { StateList } from "staff-app/components/roll-state/roll-state-list.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { RolllStateType } from "shared/models/roll"
interface FilterProps {
  id: string
  title: string
}

const FilterOptions: FilterProps[] = [
  {
    id: '1',
    title: 'First Name',
  },
  {
    id: '2',
    title: 'Last Name',
  },
]

const FilterOrder: FilterProps[] = [
  {
    id: '1',
    title: 'Ascending',
  },
  {
    id: '2',
    title: 'descending',
  },
]

const StateListDefault: StateList[] = [
  { type: "all", count: 0 },
  { type: "present", count: 0 },
  { type: "late", count: 0 },
  { type: "absent", count: 0 },
]

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [nameSearchQuery, setNameSearchQuery] = useState<string>('')
  const [filter, setFilter] = useState<string>(FilterOptions[0].id)
  const [stateList, setStateList] = useState<StateList[]>(StateListDefault)
  const [filterOrder, setFilterOrder] = useState<string>(FilterOrder[0].id)
  const [filteredUsers, setFilteredUsers] = useState<number[]>([])
  const [filterByAttendance, setFilterByAttendance] = useState<RolllStateType | "all">("all")
  const [users, setUsers] = useState<Person[] | undefined>([])
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [saveActiveRoll, savedData, saveLoader] = useApi<{ success: boolean }>({ url: "save-roll" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    searchNames()
  }, [nameSearchQuery])

  useEffect(() => {
    let updatedCount = StateListDefault
    updatedCount.map((item) => {
      item.count = getAttendanceCount(item.type)
      return
    })
    setStateList([...updatedCount])
  }, [users])

  useEffect(() => {
    if (loadState === 'loaded') { setUsers(data?.students) }
  }, [data?.students])

  const getAttendanceCount = (type: string): number => {
    let selectedUsers = users?.filter((item) => {
      if (type === "all") {
        return true
      }
      return item.roll_call === type
    })
    return selectedUsers ? selectedUsers?.length : 0
  }

  const getUsersBasedOnAttendance = (type: string): number[] => {
    let selectedUsers = users?.filter((item) => {
      if (type === "all") {
        return true
      }
      return item.roll_call === type
    })
    return selectedUsers ? selectedUsers.map((item) => item.id) : []
  }

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      clearRollAction()
      setFilterByAttendance("all")
      setIsRollMode(false)
    } else if (action === "complete") {
      let payload = users
      let updatedPayload = payload?.map((item) => {
        let respObj: {
          student_id?: number
          roll_state?: string
        } = {}
        respObj.student_id = item.id
        respObj.roll_state = item?.roll_call ? item.roll_call : 'unmark'
        return respObj
      })
      saveActiveRoll({
        student_roll_states: updatedPayload
      })
      clearRollAction()
      setFilterByAttendance("all")
      setIsRollMode(false)
    }
  }

  const clearRollAction = () => {
    const newState: Person[] | undefined = users?.map(obj => {
      return { ...obj, roll_call: 'unmark' }
    })
    newState && setUsers(newState)
  }

  const searchNames = (): void => {
    let userFound: number[] = []
    data?.students.forEach(user => {
      userFound = [...userFound, ...findMatchingStrings(nameSearchQuery, user)]
    })
    let users = Array.from(new Set(userFound))
    setFilteredUsers(users)

  }

  const sortUsers = (a: Person, b: Person): number => {
    if (filter === '1' && filterOrder === '1') {
      return a.first_name.localeCompare(b.first_name)
    } else if (filter === '1' && filterOrder === '2') {
      return b.first_name.localeCompare(a.first_name)
    } else if (filter === '2' && filterOrder === '1') {
      return a.last_name.localeCompare(b.last_name)
    } else if (filter === '2' && filterOrder === '2') {
      return b.last_name.localeCompare(a.last_name)
    }
    return 0
  }

  const findMatchingStrings = (query: string, options: Person): number[] => {
    const matchesFound = []
    const queryRegExp = new RegExp(`${query}`, "i")
    let searchable = [options.first_name, options.last_name]

    for (let index = 0; index < searchable.length; index++) {
      if (queryRegExp.test(searchable[index])) {
        matchesFound.push(options.id)
      }
    }
    return matchesFound
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction}
          nameSearch={nameSearchQuery}
          setNameSearch={setNameSearchQuery}
          filter={filter}
          setFilter={setFilter}
          filterOrder={filterOrder}
          setFilterOrder={setFilterOrder}
        />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && stateList.filter((item) => item.type === filterByAttendance).map((item) => {
          return (<div
            key={item.type}
          > <S.NoUsers>{filterByAttendance.toUpperCase()} USERS: {item.count}</S.NoUsers>
            <S.NoUsers>{item.count ? '' : 'No Users'}</S.NoUsers>
          </div>
          )
        })}

        {loadState === "loaded" && nameSearchQuery === '' && (
          <>
            {users?.sort((a: Person, b: Person) => sortUsers(a, b)).filter((item) => getUsersBasedOnAttendance(filterByAttendance).includes(item.id)).map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s}
                id={s.id}
                users={users}
                setUsers={setUsers}
                rollCall={s.roll_call}
                disableStateChange={false}
              />
            ))}
          </>
        )}
        {loadState === "loaded" && nameSearchQuery.length > 0 && (
          <>
            {users?.sort((a: Person, b: Person) => sortUsers(a, b)).filter((item) => filteredUsers.includes(item.id)).filter((item) => getUsersBasedOnAttendance(filterByAttendance).includes(item.id)).map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s}
                id={s.id}
                users={users}
                setUsers={setUsers}
                rollCall={s.roll_call}
                disableStateChange={false}
              />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} stateList={stateList}
        filterByAttendance={(type) => setFilterByAttendance(type)}
      />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  nameSearch: string
  setNameSearch: React.Dispatch<React.SetStateAction<string>>,
  filter: string,
  setFilter: React.Dispatch<React.SetStateAction<string>>,
  filterOrder: string,
  setFilterOrder: React.Dispatch<React.SetStateAction<string>>,
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, nameSearch, setNameSearch, filter, setFilter, filterOrder, setFilterOrder } = props
  return (
    <S.ToolbarContainer>
      <select
        onChange={(e) => {
          setFilter(e.target.value)
        }}
      >
        {FilterOptions.map((item) => {
          return <option value={item.id}
            key={item.id}
          >{item.title}</option>
        })}
      </select>
      <select
        onChange={(e) => {
          setFilterOrder(e.target.value)
        }}
      >
        {FilterOrder.map((item) => {
          return <option value={item.id}
            key={item.id}
          >{item.title}</option>
        })}
      </select>
      <input
        type='search'
        value={nameSearch}
        onChange={(e) => setNameSearch(e.target.value)}
      />
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  NoUsers: styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  padding: 6px 14px;
  font-weight: ${FontWeight.strong};
`,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}

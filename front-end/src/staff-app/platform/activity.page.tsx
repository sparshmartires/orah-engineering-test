import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Spacing } from "shared/styles/styles"
import { useApi } from "shared/hooks/use-api"
import { Person } from "shared/models/person"
import { Activity } from "shared/models/activity"
import { Roll } from "shared/models/roll"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { RollNumberTile } from "staff-app/components/roll-number-tile/roll-number-tile.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ListItem } from "@material-ui/core"

export const ActivityPage: React.FC = () => {
  const [getActivities, data, loader] = useApi<{ activity: Activity[] }>({ url: "get-activities" })
  const [getStudents, students, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [roll, setRoll] = useState<Roll>({
    id: 0,
    name: '',
    completed_at: new Date,
    student_roll_states: []
  })

  useEffect(() => {
    void getActivities()
  }, [getActivities])

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  return <>
    <S.PageContainer>
      {loader === "loading" && (
        <CenteredContainer>
          <FontAwesomeIcon icon="spinner" size="2x" spin />
        </CenteredContainer>
      )}
      {loader === "loaded" && (
        <>
          {data?.activity?.filter((item) => {
            if (roll.name.length > 0) {
              return item.entity.id === roll.id
            } else {
              return true
            }
          }).map((s) =>
            <RollNumberTile id={s.entity.id}
              key={s.entity.id}
              name={s.entity.name}
              onClick={() => setRoll(s.entity)}
              roll={roll}
              showAllRoles={() => setRoll({
                id: 0,
                name: '',
                completed_at: new Date,
                student_roll_states: []
              })}
            />
          )}
        </>
      )}
      {roll && loader === "loaded" && roll.name.length > 0 && (
        <>
          {roll?.student_roll_states?.map((s) =>
            <StudentListTile id={s.student_id}
              student={students?.students.filter((item) => item.id === s.student_id)[0]}
              rollCall={s.roll_state}
              isRollMode={true}
              disableStateChange={true}
              key={s.student_id}
            />
          )}
        </>
      )}
    </S.PageContainer>
  </>
}

const S = {
  PageContainer: styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  margin: ${Spacing.u4} auto 140px;
`,
}

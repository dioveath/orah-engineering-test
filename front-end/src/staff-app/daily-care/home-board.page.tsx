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
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [sortBy, setSortBy] = useState<SortBy>("first_name")
  const [orderBy, setOrderBy] = useState<OrderBy>("asc")
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction, value?: string) => {
    switch (action) {
      case "roll":
        setIsRollMode(true)
        break
      case "order":
        setOrderBy(orderBy === "asc" ? "desc" : "asc")
        break
      case "sort":
        setSortBy(sortBy === "first_name" ? "last_name" : "first_name")
        break
      case "search":
        setSearchTerm(value ?? "")
        break
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const getCompareStudentFunc = (sortBy: SortBy, orderBy: OrderBy) => {
    return (a: Person, b: Person) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      if (aValue < bValue) {
        return orderBy === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return orderBy === "asc" ? 1 : -1
      }
      return 0
    }
  }

  const getFilterFunction = (searchTerm: string) => {
    return (student: Person) => {
      return student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || student.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar
          onItemClick={onToolbarAction}
          state={{
            sortBy,
            orderBy,
          }}
        />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {data.students.filter(getFilterFunction(searchTerm)).sort(getCompareStudentFunc(sortBy, orderBy)).map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | "order" | "search"
type OrderBy = "asc" | "desc"
type SortBy = "first_name" | "last_name"
interface ToolbarState {
  sortBy: SortBy
  orderBy: OrderBy
}
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  state: ToolbarState
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, state } = props
  return (
    <S.ToolbarContainer>
      <div>
        <input name="" type="checkbox" value="" id="order-switch" onClick={() => onItemClick("order")} />
        <label htmlFor="order-switch"> {state.orderBy} </label>
        <select name="studentsort" id="sort-student" onChange={() => onItemClick("sort")}>
          <option value="first_name">First Name</option>
          <option value="last_name">Last Name</option>
        </select>
        <label htmlFor="sort-student"> Sort By </label>
      </div>
      <div>
        <input type="text" onChange={(e) => onItemClick("search", e.target.value) }/>
      </div>
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
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}

import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconBolt } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"

interface SearchPickerProps {}

export const SearchPicker: FC<SearchPickerProps> = ({}) => {
  const {
    searchCommand,
    isSearchPickerOpen,
    setIsSearchPickerOpen,
    setSearchInUse
  } = useContext(ChatbotUIContext)

  if (isSearchPickerOpen) {
    setSearchInUse("google")
  }

  const handleOpenChange = (isOpen: boolean) => {
    setIsSearchPickerOpen(isOpen)
    if (!isOpen) {
      setSearchInUse("none")
    } else {
      setSearchInUse("google")
    }
  }

  const getKeyDownHandler = () => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      handleOpenChange(false)
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleOpenChange(false)
    }
  }

  return (
    <>
      {isSearchPickerOpen && (
        <div className="bg-background flex flex-col space-y-1 rounded-xl border-2 p-2 text-sm">
          <div
            className="hover:bg-accent focus:bg-accent flex cursor-pointer items-center rounded p-2 focus:outline-none"
            onKeyDown={getKeyDownHandler()}
          >
            <IconBolt size={32} />
            <div className="ml-3 flex flex-col">
              <div className="font-bold">Google Searching</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

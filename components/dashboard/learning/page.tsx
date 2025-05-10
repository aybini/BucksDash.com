"use client"

import { useEffect } from "react"

const LearningPage = () => {
  useEffect(() => {
    // console.log("LearningPage mounted");
  }, [])

  return (
    <div>
      <h1>Learning Page</h1>
      <p>Welcome to the learning page!</p>
    </div>
  )
}

export default LearningPage

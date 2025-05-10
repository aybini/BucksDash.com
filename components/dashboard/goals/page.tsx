"use client"

import { useEffect } from "react"

const GoalsPage = () => {
  useEffect(() => {
    // console.log("GoalsPage mounted");
  }, [])

  return (
    <div>
      <h1>Goals Page</h1>
      <p>This is the goals page content.</p>
    </div>
  )
}

export default GoalsPage

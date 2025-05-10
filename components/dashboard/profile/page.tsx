"use client"

import { useEffect } from "react"

const ProfilePage = () => {
  useEffect(() => {
    // console.log("ProfilePage mounted");
  }, [])

  return (
    <div>
      <h1>Profile Page</h1>
      <p>This is the profile page content.</p>
    </div>
  )
}

export default ProfilePage

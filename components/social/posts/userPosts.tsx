
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Loader2, 
  DollarSign,
  PiggyBank,
  TrendingUp,
  Target,
  Award,
  Send,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Interface for Firestore user document data
interface UserProfileData {
  displayName?: string
  email?: string
  photoURL?: string
  badges?: string[]
  financialHealthScore?: number
  totalSavings?: number
  goalsCompleted?: number
}

// Reused interfaces from social-feed.tsx
interface UserProfile {
  id: string
  displayName?: string
  email?: string
  photoURL?: string
  badges?: string[]
  financialHealthScore?: number
  totalSavings?: number
  goalsCompleted?: number
}

interface Post {
  id: string
  userId: string
  userProfile?: UserProfile
  content: string
  imageUrl?: string
  likes: number
  comments: number
  likedBy?: string[]
  tags?: string[]
  category?: string
  mentions?: string[]
  createdAt: any // Firestore Timestamp
}

interface Comment {
  id: string
  userId: string
  userProfile?: UserProfile
  postId: string
  content: string
  mentions?: string[]
  createdAt: any // Firestore Timestamp
}

interface UserPostsProps {
  userId: string // The ID of the user whose posts are being displayed
}

export function UserPosts({ userId }: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [postComments, setPostComments] = useState<Comment[]>([])
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState("")
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map())
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (userId) {
      // Subscribe to user's posts
      const unsubscribePosts = subscribeToPosts()
      fetchUserProfiles()
      fetchUserProfile()

      return () => {
        unsubscribePosts()
      }
    }
  }, [userId])

  // Fetch the specific user's profile
  const fetchUserProfile = async () => {
    try {
      const userDocRef = doc(db, "users", userId)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfileData
        setUserProfile({
          id: userId,
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous User',
          email: userData.email,
          photoURL: userData.photoURL,
          badges: userData.badges || [],
          financialHealthScore: userData.financialHealthScore || 0,
          totalSavings: userData.totalSavings || 0,
          goalsCompleted: userData.goalsCompleted || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  // Subscribe to posts for the specific user in real-time
  const subscribeToPosts = () => {
    const postsRef = collection(db, "social", "posts", "userPosts")
    const q = query(
      postsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )

    return onSnapshot(q, (snapshot) => {
      setIsLoading(true)
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[]

      // Enhance posts with user profile data
      const enhancedPosts = fetchedPosts.map(post => ({
        ...post,
        userProfile: userProfiles.get(post.userId) || {
          id: post.userId,
          displayName: 'Anonymous User'
        }
      }))

      setPosts(enhancedPosts)
      setIsLoading(false)
    }, (error) => {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    })
  }

  // Fetch user profiles for authors of posts and comments
  const fetchUserProfiles = async () => {
    try {
      const usersRef = collection(db, "users")
      const snapshot = await getDocs(usersRef)
      
      const profiles = new Map<string, UserProfile>()
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const userData = doc.data() as UserProfileData
        profiles.set(doc.id, {
          id: doc.id,
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous User',
          email: userData.email,
          photoURL: userData.photoURL,
          badges: userData.badges || [],
          financialHealthScore: userData.financialHealthScore || 0,
          totalSavings: userData.totalSavings || 0,
          goalsCompleted: userData.goalsCompleted || 0,
        })
      })
      
      setUserProfiles(profiles)
    } catch (error) {
      console.error("Error fetching user profiles:", error)
    }
  }

  // Subscribe to post comments in real-time
  const subscribeToPostComments = (postId: string) => {
    const commentsRef = collection(db, "social", "posts", "userPosts", postId, "comments")
    const q = query(commentsRef, orderBy("createdAt", "desc"))

    return onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userProfile: userProfiles.get(doc.data().userId as string) || {
          id: doc.data().userId as string,
          displayName: 'Anonymous User'
        }
      })) as Comment[]

      setPostComments(fetchedComments)
    }, (error) => {
      console.error("Error fetching comments:", error)
    })
  }

  const handleLikePost = async (postId: string) => {
    if (!user?.uid) return

    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      const hasLiked = post.likedBy?.includes(user.uid)
      const postRef = doc(db, "social", "posts", "userPosts", postId)
      
      if (hasLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: (post.likedBy || []).filter(id => id !== user.uid)
        })
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: [...(post.likedBy || []), user.uid]
        })
      }
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOpenCommentDialog = async (post: Post) => {
    setSelectedPost(post)
    setNewCommentContent("")
    setIsCommentDialogOpen(true)
    subscribeToPostComments(post.id)
  }

  const handleAddComment = async () => {
    if (!user?.uid || !selectedPost) return

    if (!newCommentContent.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      const commentsRef = collection(db, "social", "posts", "userPosts", selectedPost.id, "comments")
      const mentions = extractMentions(newCommentContent)

      await addDoc(commentsRef, {
        userId: user.uid,
        content: newCommentContent,
        mentions,
        createdAt: serverTimestamp(),
      })

      // Update post comments count
      const postRef = doc(db, "social", "posts", "userPosts", selectedPost.id)
      await updateDoc(postRef, {
        comments: increment(1),
      })

      // Reset form
      setNewCommentContent("")

      toast({
        title: "Comment added! 💬",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to extract mentions from content
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@([\w\s]+)/g
    const matches = content.match(mentionRegex)
    if (!matches) return []

    const mentionedUsers = matches.map(mention => {
      const username = mention.substring(1).trim()
      const user = Array.from(userProfiles.values()).find(
        profile => profile.displayName?.toLowerCase() === username.toLowerCase()
      )
      return user?.id
    }).filter((id): id is string => !!id)

    return mentionedUsers
  }

  // Helper function to render content with clickable mentions
  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@[\w\s]+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.substring(1).trim()
        const user = Array.from(userProfiles.values()).find(
          profile => profile.displayName?.toLowerCase() === username.toLowerCase()
        )
        return (
          <span
            key={index}
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={() => {
              toast({
                title: "Profile",
                description: `View profile for ${username}`,
              })
            }}
          >
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  // Helper function to get category color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'budgeting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'savings': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'investing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'debt': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'goals': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  // Helper function to get category icon
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'budgeting': return <DollarSign className="w-3 h-3" />
      case 'savings': return <PiggyBank className="w-3 h-3" />
      case 'investing': return <TrendingUp className="w-3 h-3" />
      case 'goals': return <Target className="w-3 h-3" />
      default: return <MessageSquare className="w-3 h-3" />
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/20 shadow-xl p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-xl border border-gray-200/50 dark:border-gray-700/30">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {userProfile?.displayName || 'This user'} hasn’t shared any posts.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <Card
            key={post.id}
            className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={post.userProfile?.photoURL || "/placeholder.svg"}
                      alt={post.userProfile?.displayName || "User Avatar"}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
                      {(post.userProfile?.displayName || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {post.userProfile?.displayName || 'Anonymous User'}
                      </h4>
                      {post.userProfile?.badges && post.userProfile.badges.length > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {post.userProfile.badges[0]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {post.createdAt?.seconds
                        ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })
                        : 'Just now'}
                    </p>
                  </div>
                </div>
                {post.category && (
                  <Badge className={getCategoryColor(post.category)}>
                    {getCategoryIcon(post.category)}
                    <span className="ml-1 capitalize">{post.category}</span>
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                {renderContentWithMentions(post.content)}
              </p>

              {post.imageUrl && (
                <div className="mb-4">
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="rounded-lg max-h-96 w-full object-cover border border-gray-200/50 dark:border-gray-700/50"
                  />
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-0 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-700/30 rounded-b-lg">
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePost(post.id)}
                  className={`transition-all duration-300 hover:scale-105 ${
                    post.likedBy?.includes(user?.uid || '')
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${post.likedBy?.includes(user?.uid || '') ? 'fill-current' : ''}`}
                  />
                  {post.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenCommentDialog(post)}
                  className="transition-all duration-300 hover:scale-105 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {post.comments}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="transition-all duration-300 hover:scale-105 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardFooter>
          </Card>
        ))
      )}

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Comments
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Join the conversation on this post
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600">
            {/* Original Post Preview */}
            {selectedPost && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/30 mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={selectedPost.userProfile?.photoURL || "/placeholder.svg"}
                      alt={selectedPost.userProfile?.displayName || "User Avatar"}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
                      {(selectedPost.userProfile?.displayName || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedPost.userProfile?.displayName || 'Anonymous User'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPost.createdAt?.seconds
                        ? formatDistanceToNow(new Date(selectedPost.createdAt.seconds * 1000), { addSuffix: true })
                        : 'Just now'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {renderContentWithMentions(selectedPost.content)}
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {postComments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                postComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.userProfile?.photoURL || "/placeholder.svg"}
                          alt={comment.userProfile?.displayName || "User Avatar"}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-green-400 to-green-500 text-white">
                          {(comment.userProfile?.displayName || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-sm text-gray-900 dark:text-white">
                            {comment.userProfile?.displayName || 'Anonymous User'}
                          </h5>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.createdAt?.seconds
                              ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true })
                              : 'Just now'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {renderContentWithMentions(comment.content)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-700/30 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt="Your Avatar" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder="Write a thoughtful comment..."
                    className="min-h-[80px] bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 focus:border-blue-400 dark:focus:border-blue-500 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newCommentContent.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCommentDialogOpen(false)}
              className="bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  getDoc,
  where,
  onSnapshot,
  type Timestamp,
  type Unsubscribe,
  deleteField,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase-init"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  ImagePlus, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  Users,
  Send,
  Image as ImageIcon,
  Award,
  Target,
  PiggyBank,
  DollarSign,
  AtSign,
  X,
  ExternalLink,
  Copy,
  Check
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "date-fns"

// Define the User Profile type
interface UserProfile {
  id: string
  displayName?: string
  email?: string
  photoURL?: string
  badges?: string[]
  financialHealthScore?: number
  totalSavings?: number
  goalsCompleted?: number
  username?: string
}

// Define the Post type with enhanced user info
interface Post {
  id: string
  userId: string
  userProfile?: UserProfile
  content: string
  imageUrl?: string
  likes: number
  comments: number
  shares: number
  likedBy?: string[]
  sharedBy?: string[]
  tags?: string[]
  mentions?: string[]
  category?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// Define the Comment type with user info
interface Comment {
  id: string
  userId: string
  userProfile?: UserProfile
  postId: string
  content: string
  mentions?: string[]
  createdAt: Timestamp
}

// Define mention suggestion type
interface MentionSuggestion {
  id: string
  username: string
  displayName: string
  photoURL?: string
}

export function SocialFeed({ userId }: { userId?: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [newCommentContent, setNewCommentContent] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [postComments, setPostComments] = useState<Comment[]>([])
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map())
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([])
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Real-time listeners
  const [postsUnsubscribe, setPostsUnsubscribe] = useState<Unsubscribe | null>(null)
  const [commentsUnsubscribe, setCommentsUnsubscribe] = useState<Unsubscribe | null>(null)

  useEffect(() => {
    if (userId) {
      fetchUserProfiles()
      setupRealtimeListeners()
    }

    return () => {
      // Cleanup listeners on unmount
      if (postsUnsubscribe) postsUnsubscribe()
      if (commentsUnsubscribe) commentsUnsubscribe()
    }
  }, [userId])

  // Setup real-time listeners for posts
  const setupRealtimeListeners = useCallback(() => {
    if (!userId) return

    const postsRef = collection(db, "social", "posts", "userPosts")
    const q = query(postsRef, orderBy("createdAt", "desc"), limit(50))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => {
        const postData = doc.data()
        return {
          id: doc.id,
          ...postData,
        } as Post
      })

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
      console.error("Error listening to posts:", error)
      toast({
        title: "Connection Error",
        description: "Failed to sync posts. Please check your connection.",
        variant: "destructive",
      })
      setIsLoading(false)
    })

    setPostsUnsubscribe(() => unsubscribe)
  }, [userId, userProfiles, toast])

  // Fetch user profiles for better display and mention suggestions
  const fetchUserProfiles = async () => {
    try {
      const usersRef = collection(db, "users")
      const snapshot = await getDocs(usersRef)
      
      const profiles = new Map<string, UserProfile>()
      const suggestions: MentionSuggestion[] = []
      
      snapshot.docs.forEach((doc) => {
        const userData = doc.data()
        const profile = {
          id: doc.id,
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous User',
          email: userData.email,
          photoURL: userData.photoURL,
          badges: userData.badges || [],
          financialHealthScore: userData.financialHealthScore || 0,
          totalSavings: userData.totalSavings || 0,
          goalsCompleted: userData.goalsCompleted || 0,
          username: userData.username || userData.email?.split('@')[0] || doc.id.substring(0, 8),
        }
        
        profiles.set(doc.id, profile)
        
        // Add to mention suggestions (exclude current user)
        if (doc.id !== userId) {
          suggestions.push({
            id: doc.id,
            username: profile.username,
            displayName: profile.displayName,
            photoURL: profile.photoURL,
          })
        }
      })
      
      setUserProfiles(profiles)
      setMentionSuggestions(suggestions)
    } catch (error) {
      console.error("Error fetching user profiles:", error)
    }
  }

  // Setup real-time listener for comments
  const setupCommentsListener = useCallback((postId: string) => {
    if (commentsUnsubscribe) {
      commentsUnsubscribe()
    }

    const commentsRef = collection(db, "social", "posts", "userPosts", postId, "comments")
    const q = query(commentsRef, orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userProfile: userProfiles.get(doc.data().userId) || {
          id: doc.data().userId,
          displayName: 'Anonymous User'
        }
      })) as Comment[]

      setPostComments(fetchedComments)
    }, (error) => {
      console.error("Error listening to comments:", error)
    })

    setCommentsUnsubscribe(() => unsubscribe)
  }, [userProfiles, commentsUnsubscribe])

  const handleCreatePost = async () => {
    if (!userId) return

    if (!newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingPost(true)
    try {
      const postsRef = collection(db, "social", "posts", "userPosts")

      // Upload image if selected
      let imageUrl: string | undefined
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, userId)
      }

      // Auto-detect tags, mentions and category from content
      const tags = extractTags(newPostContent)
      const mentions = extractMentions(newPostContent)
      const category = detectCategory(newPostContent)

      // Create the post
      await addDoc(postsRef, {
        userId,
        content: newPostContent,
        imageUrl: imageUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        likedBy: [],
        sharedBy: [],
        tags,
        mentions,
        category,
        createdAt: serverTimestamp(),
      })

      // Create notifications for mentioned users
      if (mentions.length > 0) {
        await createMentionNotifications(mentions, userId, newPostContent)
      }

      // Reset form
      setNewPostContent("")
      setSelectedImage(null)
      setIsImageDialogOpen(false)

      toast({
        title: "Post created! 🎉",
        description: "Your post has been shared with the community.",
      })
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingPost(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!userId) return

    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      const hasLiked = post.likedBy?.includes(userId)
      const postRef = doc(db, "social", "posts", "userPosts", postId)
      
      if (hasLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: (post.likedBy || []).filter(id => id !== userId)
        })
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: [...(post.likedBy || []), userId]
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

  const handleSharePost = async (post: Post) => {
    if (!userId) return

    try {
      const postRef = doc(db, "social", "posts", "userPosts", post.id)
      const hasShared = post.sharedBy?.includes(userId)
      
      if (!hasShared) {
        await updateDoc(postRef, {
          shares: increment(1),
          sharedBy: [...(post.sharedBy || []), userId]
        })

        toast({
          title: "Post shared! 🚀",
          description: "The post has been shared successfully.",
        })
      }

      // Generate shareable URL
      const url = `${window.location.origin}/social/post/${post.id}`
      setShareUrl(url)
      setSelectedPost(post)
      setIsShareDialogOpen(true)
    } catch (error) {
      console.error("Error sharing post:", error)
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOpenCommentDialog = async (post: Post) => {
    setSelectedPost(post)
    setNewCommentContent("")
    setIsCommentDialogOpen(true)
    setupCommentsListener(post.id)
  }

  const handleAddComment = async () => {
    if (!userId || !selectedPost) return

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
        userId,
        content: newCommentContent,
        mentions,
        createdAt: serverTimestamp(),
      })

      // Update post comments count
      const postRef = doc(db, "social", "posts", "userPosts", selectedPost.id)
      await updateDoc(postRef, {
        comments: increment(1),
      })

      // Create notifications for mentioned users in comments
      if (mentions.length > 0) {
        await createMentionNotifications(mentions, userId, newCommentContent, selectedPost.id)
      }

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      setSelectedImage(file)
      setIsImageDialogOpen(true)
    }
  }

  const uploadImage = async (image: File, userId: string): Promise<string> => {
    setUploadingImage(true)
    try {
      if (!storage) {
        throw new Error("Storage is not initialized")
      }
      
      const timestamp = Date.now()
      const fileName = `${timestamp}_${image.name}`
      const storageRef = ref(storage, `social-images/${userId}/${fileName}`)
      
      const snapshot = await uploadBytes(storageRef, image)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle @mentions in text input
  const handleContentChange = (value: string, isComment = false) => {
    if (isComment) {
      setNewCommentContent(value)
    } else {
      setNewPostContent(value)
    }

    // Check for @mentions
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1)
      const spaceIndex = textAfterAt.indexOf(' ')
      const currentMention = spaceIndex === -1 ? textAfterAt : textAfterAt.slice(0, spaceIndex)

      if (currentMention.length > 0) {
        setMentionQuery(currentMention.toLowerCase())
        setShowMentionSuggestions(true)
      } else {
        setShowMentionSuggestions(false)
      }
    } else {
      setShowMentionSuggestions(false)
    }
  }

  const insertMention = (suggestion: MentionSuggestion, isComment = false) => {
    const currentContent = isComment ? newCommentContent : newPostContent
    const lastAtIndex = currentContent.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      const beforeAt = currentContent.slice(0, lastAtIndex)
      const afterAt = currentContent.slice(lastAtIndex + 1)
      const spaceIndex = afterAt.indexOf(' ')
      const afterMention = spaceIndex === -1 ? '' : afterAt.slice(spaceIndex)
      
      const newContent = `${beforeAt}@${suggestion.username} ${afterMention}`
      
      if (isComment) {
        setNewCommentContent(newContent)
      } else {
        setNewPostContent(newContent)
      }
    }
    
    setShowMentionSuggestions(false)
    setMentionQuery("")
  }

  // Filter mention suggestions based on query
  const filteredMentionSuggestions = useMemo(() => {
    if (!mentionQuery) return mentionSuggestions.slice(0, 5)
    
    return mentionSuggestions
      .filter(suggestion => 
        suggestion.username.toLowerCase().includes(mentionQuery) ||
        suggestion.displayName.toLowerCase().includes(mentionQuery)
      )
      .slice(0, 5)
  }, [mentionSuggestions, mentionQuery])

  // Helper function to extract hashtags from content
  const extractTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g
    const matches = content.match(tagRegex)
    return matches ? matches.map(tag => tag.substring(1)) : []
  }

  // Helper function to extract mentions from content
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const matches = content.match(mentionRegex)
    return matches ? matches.map(mention => mention.substring(1)) : []
  }

  // Helper function to detect post category
  const detectCategory = (content: string): string => {
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes('budget') || lowerContent.includes('expense')) return 'budgeting'
    if (lowerContent.includes('save') || lowerContent.includes('saving')) return 'savings'
    if (lowerContent.includes('invest') || lowerContent.includes('stock')) return 'investing'
    if (lowerContent.includes('debt') || lowerContent.includes('loan')) return 'debt'
    if (lowerContent.includes('goal') || lowerContent.includes('target')) return 'goals'
    return 'general'
  }

  // Create notifications for mentioned users
  const createMentionNotifications = async (mentions: string[], mentioningUserId: string, content: string, postId?: string) => {
    try {
      const mentioningUser = userProfiles.get(mentioningUserId)
      const notificationsRef = collection(db, "notifications")

      for (const username of mentions) {
        // Find user by username
        const mentionedUser = Array.from(userProfiles.values()).find(
          user => user.username === username
        )

        if (mentionedUser && mentionedUser.id !== mentioningUserId) {
          await addDoc(notificationsRef, {
            userId: mentionedUser.id,
            type: postId ? 'comment_mention' : 'post_mention',
            fromUserId: mentioningUserId,
            fromUserName: mentioningUser?.displayName || 'Unknown User',
            content: content.length > 100 ? content.substring(0, 100) + '...' : content,
            postId: postId || null,
            read: false,
            createdAt: serverTimestamp(),
          })
        }
      }
    } catch (error) {
      console.error("Error creating mention notifications:", error)
    }
  }

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

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'budgeting': return <DollarSign className="w-3 h-3" />
      case 'savings': return <PiggyBank className="w-3 h-3" />
      case 'investing': return <TrendingUp className="w-3 h-3" />
      case 'goals': return <Target className="w-3 h-3" />
      default: return <MessageSquare className="w-3 h-3" />
    }
  }

  // Render content with clickable mentions and hashtags
  const renderContentWithMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g
    const hashtagRegex = /#(\w+)/g
    
    let parts = [content]
    
    // Process mentions
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part]
      return part.split(mentionRegex).map((text, index) => {
        if (index % 2 === 1) {
          // This is a username
          return (
            <span key={`mention-${index}`} className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
              @{text}
            </span>
          )
        }
        return text
      })
    })
    
    // Process hashtags
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part]
      return part.split(hashtagRegex).map((text, index) => {
        if (index % 2 === 1) {
          // This is a hashtag
          return (
            <span key={`hashtag-${index}`} className="text-purple-600 dark:text-purple-400 font-medium cursor-pointer hover:underline">
              #{text}
            </span>
          )
        }
        return text
      })
    })
    
    return <>{parts}</>
  }

  if (isLoading) {
    return (
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/20 shadow-xl">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <MessageSquare className="h-6 w-6 text-blue-500" />
              <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Social Feed</h3>
              <p className="text-gray-600 dark:text-gray-400">Loading community posts...</p>
            </div>
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/30">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{posts.length}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Posts Today</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{userProfiles.size}</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Active Users</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/30">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                {posts.reduce((sum, post) => sum + post.likes, 0)}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Total Likes</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/30">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                {posts.reduce((sum, post) => sum + (post.shares || 0), 0)}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Total Shares</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feed Card */}
      <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-gray-200/50 dark:border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
              </div>
              <div>
                <CardTitle className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Community Feed
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Share your financial journey and connect with others
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Live Updates
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Enhanced Create Post Section */}
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl p-6 mb-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt="Your Avatar" />
                <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3 relative">
                <div className="relative">
                  <Textarea
                    value={newPostContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Share your financial wins, tips, or ask for advice... Use #tags and @mentions!"
                    className="min-h-[100px] bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 focus:border-blue-400 dark:focus:border-blue-500 transition-colors resize-none pr-12"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                    {newPostContent.length}/1000
                  </div>
                </div>

                {/* Mention Suggestions Dropdown */}
                {showMentionSuggestions && filteredMentionSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredMentionSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        onClick={() => insertMention(suggestion)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={suggestion.photoURL || "/placeholder.svg"} alt={suggestion.displayName} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-500 text-white text-sm">
                            {suggestion.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            @{suggestion.username}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.displayName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild className="bg-white/60 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Photo
                      </Label>
                    </Button>
                    <input 
                      type="file" 
                      id="image-upload" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/60 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={() => {
                        const textarea = document.querySelector('textarea')
                        if (textarea) {
                          const cursorPos = textarea.selectionStart
                          const newContent = newPostContent.slice(0, cursorPos) + '@' + newPostContent.slice(cursorPos)
                          setNewPostContent(newContent)
                          setTimeout(() => {
                            textarea.setSelectionRange(cursorPos + 1, cursorPos + 1)
                            textarea.focus()
                          }, 0)
                        }
                      }}
                    >
                      <AtSign className="h-4 w-4 mr-2" />
                      Mention
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost} 
                    disabled={isCreatingPost || !newPostContent.trim() || newPostContent.length > 1000}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105"
                  >
                    {isCreatingPost ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Share Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-xl border border-gray-200/50 dark:border-gray-700/30">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to share your financial journey!</p>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 group">
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
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              @{post.userProfile?.username || 'unknown'}
                            </span>
                            {post.userProfile?.badges && post.userProfile.badges.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                <Award className="w-3 h-3 mr-1" />
                                {post.userProfile.badges[0]}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })}
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
                    <div className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                      {renderContentWithMentions(post.content)}
                    </div>
                    
                    {post.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={post.imageUrl}
                          alt="Post image"
                          className="rounded-lg max-h-96 w-full object-cover border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(post.imageUrl, '_blank')}
                        />
                      </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30">
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
                          post.likedBy?.includes(userId || '') 
                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${post.likedBy?.includes(userId || '') ? 'fill-current' : ''}`} />
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSharePost(post)}
                        className={`transition-all duration-300 hover:scale-105 ${
                          post.sharedBy?.includes(userId || '') 
                            ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        {post.shares || 0}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={(open) => {
        setIsCommentDialogOpen(open)
        if (!open && commentsUnsubscribe) {
          commentsUnsubscribe()
          setCommentsUnsubscribe(null)
        }
      }}>
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
                      {formatDistanceToNow(new Date(selectedPost.createdAt.seconds * 1000), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {renderContentWithMentions(selectedPost.content)}
                </div>
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
                  <div key={comment.id} className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
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
                            @{comment.userProfile?.username || 'unknown'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {renderContentWithMentions(comment.content)}
                        </div>
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
                <div className="flex-1 space-y-3 relative">
                  <div className="relative">
                    <Textarea
                      value={newCommentContent}
                      onChange={(e) => handleContentChange(e.target.value, true)}
                      placeholder="Write a thoughtful comment... Use @mentions to notify users!"
                      className="min-h-[80px] bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 focus:border-blue-400 dark:focus:border-blue-500 transition-colors resize-none pr-12"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                      {newCommentContent.length}/500
                    </div>
                  </div>

                  {/* Mention Suggestions for Comments */}
                  {showMentionSuggestions && filteredMentionSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredMentionSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          onClick={() => insertMention(suggestion, true)}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={suggestion.photoURL || "/placeholder.svg"} alt={suggestion.displayName} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-500 text-white text-sm">
                              {suggestion.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                              @{suggestion.username}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {suggestion.displayName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/60 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[placeholder*="thoughtful comment"]')
                        if (textarea) {
                          const cursorPos = textarea.selectionStart
                          const newContent = newCommentContent.slice(0, cursorPos) + '@' + newCommentContent.slice(cursorPos)
                          setNewCommentContent(newContent)
                          setTimeout(() => {
                            textarea.setSelectionRange(cursorPos + 1, cursorPos + 1)
                            textarea.focus()
                          }, 0)
                        }
                      }}
                    >
                      <AtSign className="h-4 w-4 mr-2" />
                      Mention
                    </Button>
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newCommentContent.trim() || newCommentContent.length > 500}
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

      {/* Enhanced Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-green-500" />
              <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Share Post
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Share this post with others
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedPost && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/30">
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
                      {formatDistanceToNow(new Date(selectedPost.createdAt.seconds * 1000), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {renderContentWithMentions(selectedPost.content)}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="share-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Share Link
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20"
                />
                <Button
                  onClick={handleCopyShareUrl}
                  variant="outline"
                  className="bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this post!')}`, '_blank')}
                variant="outline"
                className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                variant="outline"
                className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                variant="outline"
                className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsShareDialogOpen(false)}
              className="bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Image Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Add Image to Post
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Share a photo to make your post more engaging
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedImage ? (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected Image"
                    className="max-h-64 max-w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                  />
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200/50 dark:border-green-700/30">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Image ready to upload: {selectedImage.name}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    File size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg border border-gray-200/50 dark:border-gray-700/30">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No image selected</p>
              </div>
            )}
          </div>

          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImageDialogOpen(false)
                setSelectedImage(null)
              }}
              className="bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost} 
              disabled={uploadingImage || isCreatingPost}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              {uploadingImage || isCreatingPost ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadingImage ? "Uploading..." : "Creating..."}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
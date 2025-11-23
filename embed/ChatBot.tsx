import React, { useEffect, useRef, useState } from 'react'
import { X, Send, Mic, MessageCircle, Minimize2, Bot, MessageSquare, Sparkles, Star, Headphones, HelpCircle, Smile } from 'lucide-react'

type MessageRole = 'user' | 'bot'

interface ChatBotProps {
  botId: string
  apiUrl?: string
}

interface Message {
  role: MessageRole
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface BotConfig {
  name: string
  description?: string
  avatarUrl?: string
  icon?: string
  iconLabel?: string
  iconColor?: string
  iconSize?: number
  placeholder?: string
  headerColor?: string
  foregroundColor?: string
  backgroundColor?: string
  userChatColor?: string
  botChatColor?: string
  userTextColor?: string
  botTextColor?: string
  headerSize?: number
  chatbotSizeX?: number
  chatbotSizeY?: number
  audioInput?: boolean
  desktop?: boolean
  mobile?: boolean
  autoOpen?: boolean
  welcomeMessage?: string
  faqs?: Array<{ question: string; answer: string }>
}

export default function ChatBot({ botId, apiUrl }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<BotConfig | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Mobile detection with resize listener
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerHeight : 0
  )

  // Determine API base URL: prop > env > data attribute > default
  const getApiBase = () => {
    if (apiUrl) return apiUrl
    if ((import.meta as any).env?.VITE_API_URL) return (import.meta as any).env.VITE_API_URL
    // Try to get from data attribute on script tag or container
    if (typeof document !== 'undefined') {
      const scriptTag = document.querySelector('script[data-api-url]')
      if (scriptTag) {
        const dataApiUrl = scriptTag.getAttribute('data-api-url')
        if (dataApiUrl) return dataApiUrl
      }
      const container = document.getElementById(`chatbot-container-${botId}`)
      if (container) {
        const dataApiUrl = container.getAttribute('data-api-url')
        if (dataApiUrl) return dataApiUrl
      }
    }
    return 'http://localhost:5000/api'
  }

  const API_BASE = getApiBase()

  // Icon mapping
  const iconMap = {
    'bot': Bot,
    'message-circle': MessageCircle,
    'message-square': MessageSquare,
    'send': Send,
    'sparkles': Sparkles,
    'star': Star,
    'headphones': Headphones,
    'help-circle': HelpCircle,
    'smile': Smile
  }

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || MessageCircle
  }

  // Render structured JSON content if present; otherwise fallback to smart text rendering
  const renderStructuredOrText = (content: string | any) => {
    // If content is already a structured object from backend
    if (content && typeof content === 'object') {
      const data = content as any
      const blocks: React.ReactNode[] = []
      if (data.text) {
        blocks.push(
          <div key="text" style={{ whiteSpace: 'pre-line' }}>{data.text}</div>
        )
      }
      if (Array.isArray(data.images) && data.images.length) {
        blocks.push(
          <div key="images" style={{ marginTop: '8px' }}>
            {data.images.map((img: any, idx: number) => (
              <div key={idx} style={{ marginTop: '8px', marginBottom: '8px' }}>
                <img
                  src={img.url}
                  alt={img.alt || 'Image'}
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => window.open(img.url, '_blank')}
                />
              </div>
            ))}
          </div>
        )
      }
      if (Array.isArray(data.links) && data.links.length) {
        blocks.push(
          <div key="links" style={{ marginTop: '8px', display: 'grid', gap: '6px' }}>
            {data.links.map((lnk: any, idx: number) => (
              <div key={idx} style={{ fontSize: '13px' }}>
                <span style={{ color: '#111827' }}>link to {lnk.label || lnk.url}: </span>
                <a href={lnk.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{lnk.url}</a>
              </div>
            ))}
          </div>
        )
      }
      if (data.contacts && typeof data.contacts === 'object') {
        const c = data.contacts
        const items: React.ReactNode[] = []
        if (c.email) items.push(
          <div key="email" style={{ fontSize: '13px' }}>
            <span style={{ color: '#111827' }}>contact {`{email address}`}: </span>
            <a href={`mailto:${c.email}`} style={{ color: '#3b82f6', textDecoration: 'underline' }}>{c.email}</a>
          </div>
        )
        if (c.phone) items.push(
          <div key="phone" style={{ fontSize: '13px' }}>
            <span style={{ color: '#111827' }}>contact {`{phone number}`}: </span>
            <a href={`tel:${String(c.phone).replace(/\s/g,'')}`} style={{ color: '#3b82f6', textDecoration: 'underline' }}>{c.phone}</a>
          </div>
        )
        if (c.website) items.push(
          <div key="website" style={{ fontSize: '13px' }}>
            <span style={{ color: '#111827' }}>link to {`{website}`}: </span>
            <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{c.website}</a>
          </div>
        )
        if (Array.isArray(c.socialMedia)) {
          c.socialMedia.forEach((s: any, i: number) => {
            items.push(
              <div key={`sm-${i}`} style={{ fontSize: '13px' }}>
                <span style={{ color: '#111827' }}>link to {`{${s.platform || 'social'}}`}: </span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{s.url}</a>
              </div>
            )
          })
        }
        if (items.length) {
          blocks.push(
            <div key="contacts" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>{items}</div>
          )
        }
      }
      return <>{blocks}</>
    }

    // If content is a string that might be JSON, try parsing
    if (typeof content === 'string') {
      const trimmed = content.trim()
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const data = JSON.parse(trimmed)
          return renderStructuredOrText(data)
        } catch (_) {
          // fall through to plain rendering
        }
      }
      return renderRichText(content)
    }
    return null
  }

  // Helper function to render plain text with URL/email/phone detection
  const renderRichText = (content: string) => {
    // Regular expression to match URLs (including Cloudinary URLs)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part: string, index: number) => {
      if (urlRegex.test(part)) {
        // Check if it's an image URL
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(part) || 
                       part.includes('cloudinary.com') || 
                       part.includes('imgbb.com');
        
        if (isImage) {
          return (
            <div key={index} style={{ marginTop: '8px', marginBottom: '8px' }}>
              <img 
                src={part} 
                alt="Chat image" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  borderRadius: '8px',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(part, '_blank')}
                onError={(e) => {
                  // If image fails to load, show as a clickable link
                  e.currentTarget.style.display = 'none';
                  const linkElement = document.createElement('a');
                  linkElement.href = part;
                  linkElement.target = '_blank';
                  linkElement.textContent = part;
                  linkElement.style.color = '#3b82f6';
                  linkElement.style.textDecoration = 'underline';
                  e.currentTarget.parentNode?.appendChild(linkElement);
                }}
              />
            </div>
          );
        } else {
          // Regular URL - make it clickable
          return (
            <a 
              key={index} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'underline' }}
            >
              {part}
            </a>
          );
        }
      }
      
      // Check for contact information patterns and make them clickable
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
      
      // Process email addresses
      if (emailRegex.test(part)) {
        const emails = part.match(emailRegex);
        let processedPart = part;
        emails?.forEach(email => {
          processedPart = processedPart.replace(email, `<a href="mailto:${email}" style="color: #3b82f6; text-decoration: underline;">${email}</a>`);
        });
        return <span key={index} dangerouslySetInnerHTML={{ __html: processedPart }} />;
      }
      
      // Process phone numbers
      if (phoneRegex.test(part)) {
        const phones = part.match(phoneRegex);
        let processedPart = part;
        phones?.forEach(phone => {
          const cleanPhone = phone.replace(/\s/g, '');
          processedPart = processedPart.replace(phone, `<a href="tel:${cleanPhone}" style="color: #3b82f6; text-decoration: underline;">${phone}</a>`);
        });
        return <span key={index} dangerouslySetInnerHTML={{ __html: processedPart }} />;
      }
      
      return part;
    });
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_BASE}/chatbots/by-bot/${botId}`)
        const data = await res.json()
        if (res.ok) {
          setConfig(data.chatbot)
          if (data.chatbot.autoOpen) setIsOpen(true)
          if (data.chatbot.welcomeMessage) {
            setMessages([{ role: 'bot', content: data.chatbot.welcomeMessage, timestamp: new Date() }])
          }
        }
      } catch (e) {
        console.error('Failed to load chatbot config:', e)
      }
    }
    fetchConfig()
  }, [botId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Track online/offline to reflect availability in header
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Responsive mobile detection and viewport height tracking
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
        setViewportHeight(window.innerHeight)
      }
    }
    
    // Handle viewport height changes (important for mobile keyboard)
    const handleViewportChange = () => {
      if (typeof window !== 'undefined') {
        setViewportHeight(window.visualViewport?.height || window.innerHeight)
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      window.visualViewport?.addEventListener('resize', handleViewportChange)
      // Also listen to orientation changes
      window.addEventListener('orientationchange', handleResize)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        window.visualViewport?.removeEventListener('resize', handleViewportChange)
        window.removeEventListener('orientationchange', handleResize)
      }
    }
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return
    const userMessage: Message = { role: 'user', content, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    try {
      const history = messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, message: content, history }),
      })
      const data = await res.json()
      if (res.ok) {
        // If backend returns structured response object, store as JSON string to preserve typing
        const responseContent = typeof data.response === 'object' ? JSON.stringify(data.response) : data.response
        const botMessage: Message = { role: 'bot', content: responseContent, timestamp: new Date(), suggestions: data.suggestions || data.suggestedQuestions || [] }
        setMessages((prev) => [...prev, botMessage])
        if (data.suggestions?.length) setSuggestedQuestions(data.suggestions)
        if (data.suggestedQuestions?.length) setSuggestedQuestions(data.suggestedQuestions)
      }
    } catch (e) {
      const err: Message = { role: 'bot', content: 'Sorry, I encountered an error.', timestamp: new Date() }
      setMessages((prev) => [...prev, err])
    } finally {
      setLoading(false)
    }
  }

  if (!config) return null

  const shouldDisplay = isMobile ? config.mobile : config.desktop
  if (!shouldDisplay) return null

  const headerColor = config.headerColor || '#3b82f6'
  const foregroundColor = config.foregroundColor || '#ffffff'
  const backgroundColor = config.backgroundColor || '#f3f4f6'
  const userChatColor = config.userChatColor || '#3b82f6'
  const botChatColor = config.botChatColor || '#e5e7eb'
  const userTextColor = config.userTextColor || '#ffffff'
  const botTextColor = config.botTextColor || '#000000'
  const iconSize = config.iconSize || 60
  // Auto-determine icon color based on background brightness
  const isLightBackground = config.headerColor && (
    config.headerColor.toLowerCase() === '#ffffff' ||
    config.headerColor.toLowerCase() === '#fff' ||
    config.headerColor.toLowerCase().includes('fff')
  )
  const iconColor = isLightBackground ? '#000000' : '#ffffff'
  const chatWidth = config.chatbotSizeX || 400
  const chatHeight = config.chatbotSizeY || 600
  const headerSize = config.headerSize || 60

  // Helper function to convert hex color to CSS filter
  const hexToFilter = (hex: string) => {
    if (hex === '#ffffff' || hex === '#FFFFFF') return 'invert(1)';
    if (hex === '#000000' || hex === '#000000') return 'invert(0)';
    
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Simple approximation for common colors
    if (r > 200 && g < 100 && b < 100) return 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'; // Red
    if (r < 100 && g > 200 && b < 100) return 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)'; // Green
    if (r < 100 && g < 100 && b > 200) return 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'; // Blue
    
    return 'invert(1)'; // Default to white
  };

  // Debug: Log the config to see what's being loaded
  console.log('ChatBot config:', config)
  console.log('Chat dimensions:', { chatWidth, chatHeight, iconSize })

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed rounded-full transition-all duration-200 z-50 group hover:scale-110 active:scale-95"
          style={{
            width: `${Math.max(iconSize, isMobile ? 56 : 44)}px`,
            height: `${Math.max(iconSize, isMobile ? 56 : 44)}px`,
            background: headerColor,
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            bottom: isMobile ? 'calc(16px + env(safe-area-inset-bottom))' : '24px',
            right: isMobile ? 'calc(16px + env(safe-area-inset-right))' : '24px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          aria-label="Open chat"
        >
          {config.icon ? (
            // Check if it's a URL (for backward compatibility)
            config.icon.startsWith('http') ? (
              <img
                src={config.icon}
                alt="Chat"
                style={{ 
                  width: '60%', 
                  height: '60%', 
                  objectFit: 'contain'
                }}
              />
            ) : (
              // Use Lucide icon component
              (() => {
                const IconComponent = getIconComponent(config.icon)
                return (
                  <IconComponent
                    size={Math.max(Math.floor(iconSize * 0.55), 20)}
                    style={{ color: iconColor }}
                  />
                )
              })()
            )
          ) : (
            <MessageCircle
              size={Math.max(Math.floor(iconSize * 0.55), 20)}
              style={{ color: iconColor }}
            />
          )}
          {config.iconLabel && (
            <div 
              className="absolute right-full mr-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none transform translate-x-4 group-hover:translate-x-0"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: 1000
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  filter: 'blur(8px)',
                  opacity: 0.4,
                  zIndex: -1
                }}
              />
              <div style={{ 
                position: 'relative', 
                zIndex: 10, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                <div 
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)'
                  }}
                />
                <span style={{ letterSpacing: '0.5px' }}>{config.iconLabel}</span>
              </div>
            </div>
          )}
        </button>
      )}

      {isOpen && (
        <div
          className="fixed flex flex-col rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideUp"
          style={{
            width: isMobile ? 'calc(100vw - 32px)' : '320px',
            maxWidth: isMobile ? '300px' : '300px',
            height: isMobile 
              ? isMinimized 
                ? `${headerSize}px` 
                : 'min(75vh, 550px)'
              : isMinimized 
                ? `${headerSize}px` 
                : '450px',
            maxHeight: isMobile 
              ? `calc(${viewportHeight || window.innerHeight}px * 0.80)` 
              : 'none',
            backgroundColor: backgroundColor,
            borderRadius: isMobile ? '16px' : '20px',
            boxShadow: isMobile 
              ? '0 10px 40px rgba(0, 0, 0, 0.2)' 
              : '0 20px 60px rgba(0, 0, 0, 0.2)',
            bottom: isMobile ? '16px' : '24px',
            right: isMobile ? '16px' : '24px',
            left: isMobile ? 'auto' : 'auto',
            top: isMobile ? 'auto' : 'auto',
            paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : '0',
            paddingLeft: isMobile ? '0' : '0',
            paddingRight: isMobile ? '0' : '0',
            display: 'flex',
            flexDirection: 'column',
            margin: isMobile ? '0 auto' : '0'
          }}
        >
          <div className="flex items-center justify-between px-4 flex-shrink-0" style={{ 
            height: isMobile ? '56px' : '60px', 
            background: `linear-gradient(45deg, ${headerColor}, ${headerColor}dd)`,
            color: foregroundColor,
            padding: isMobile ? '0 16px' : '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '28px', height: '28px', backgroundColor: 'rgba(255,255,255,0.15)', paddingRight: '4px' }}>
                {config.avatarUrl ? (
                  <img src={config.avatarUrl} alt={config.name} className="w-full h-full rounded-full object-cover" style={{ opacity: 0.95 }} />
                ) : (
                  <MessageCircle size={14} style={{ color: foregroundColor }} />
                )}
              </div>
              <div className="min-w-0 flex-1" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? '13px' : '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{config.name}</h3>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', fontSize: isMobile ? '9px' : '10px', opacity: 0.9, padding: '2px 6px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.12)', width: 'fit-content', marginTop: '2px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#10b981' : '#ef4444',
                    flexShrink: 0
                  }} />
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0">
              <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', opacity: 0.8 }} aria-label="Minimize">
                <Minimize2 size={16} style={{ color: foregroundColor }} />
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', opacity: 0.8 }} aria-label="Close chat">
                <X size={16} style={{ color: foregroundColor }} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div 
                className="flex-1 overflow-y-auto space-y-3" 
                style={{ 
                  backgroundColor: backgroundColor,
                  padding: isMobile ? '10px 12px' : '16px',
                  paddingBottom: isMobile ? '90px' : '80px',
                  paddingTop: isMobile ? '8px' : '16px',
                  flex: 1,
                  minHeight: 0,
                  maxHeight: '100%',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain'
                }}
              >
                {messages.map((m, i) => (
                  <div key={i}>
                    <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: '12px' }}>
                      <div className="max-w-[85%] shadow-sm" style={{ 
                        backgroundColor: m.role === 'user' ? userChatColor : botChatColor, 
                        color: m.role === 'user' ? userTextColor : botTextColor,
                        borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '85%'
                      }}>
                        <div style={{ 
                          margin: 0, 
                          fontSize: '13px', 
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-line'
                        }}>
                          {(() => {
                            // Try to parse content if it's JSON string
                            try {
                              const maybeObj = JSON.parse(m.content as unknown as string)
                              return renderStructuredOrText(maybeObj)
                            } catch {
                              return renderStructuredOrText(m.content)
                            }
                          })()}
                        </div>
                        <span style={{ 
                          fontSize: '10px', 
                          opacity: 0.7, 
                          display: 'block',
                          marginTop: '4px'
                        }}>
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Suggestion buttons for bot messages */}
                    {m.role === 'bot' && m.suggestions && m.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-start" style={{ marginBottom: '12px', marginLeft: isMobile ? '0' : '8px' }}>
                        {m.suggestions.map((suggestion, suggestionIndex) => (
                          <button
                            key={suggestionIndex}
                            onClick={() => {
                              sendMessage(suggestion)
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: '#ffffff',
                              borderRadius: '20px',
                              padding: isMobile ? '10px 16px' : '8px 16px',
                              fontSize: isMobile ? '14px' : '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              backdropFilter: 'blur(10px)',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                              maxWidth: isMobile ? 'calc(100vw - 32px)' : '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              minHeight: isMobile ? '44px' : 'auto',
                              WebkitTapHighlightColor: 'transparent',
                              touchAction: 'manipulation',
                              active: { transform: 'scale(0.95)' }
                            } as React.CSSProperties & { active?: { transform: string } }}
                            onTouchStart={(e: React.TouchEvent<HTMLButtonElement>) => {
                              e.currentTarget.style.transform = 'scale(0.95)'
                            }}
                            onTouchEnd={(e: React.TouchEvent<HTMLButtonElement>) => {
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                              if (!isMobile) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                              }
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                              if (!isMobile) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                              }
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="typing-indicator" style={{ position: 'relative', height: '10px', width: '35px', marginLeft: '6px' }}>
                      <span style={{ 
                        content: '',
                        height: '10px',
                        width: '10px',
                        background: botTextColor,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        borderRadius: '50%',
                        animation: 'blink 1.5s infinite',
                        animationFillMode: 'both'
                      }}></span>
                      <span style={{ 
                        content: '',
                        height: '10px',
                        width: '10px',
                        background: botTextColor,
                        position: 'absolute',
                        left: '15px',
                        top: 0,
                        borderRadius: '50%',
                        animation: 'blink 1.5s infinite',
                        animationFillMode: 'both',
                        animationDelay: '0.2s'
                      }}></span>
                      <span style={{ 
                        content: '',
                        height: '10px',
                        width: '10px',
                        background: botTextColor,
                        position: 'absolute',
                        left: '30px',
                        top: 0,
                        borderRadius: '50%',
                        animation: 'blink 1.5s infinite',
                        animationFillMode: 'both',
                        animationDelay: '0.4s'
                      }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div 
                className="flex-shrink-0" 
                style={{ 
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: isMobile ? '10px 10px calc(10px + env(safe-area-inset-bottom))' : '12px',
                  background: backgroundColor,
                  display: 'flex',
                  gap: isMobile ? '8px' : '6px',
                  borderTop: isMobile ? '1px solid rgba(0,0,0,0.08)' : 'none',
                  zIndex: 10,
                  borderRadius: isMobile ? '0 0 16px 16px' : '0'
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(inputValue)
                  }}
                  className="flex gap-2 w-full"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={config.placeholder || 'Type your message...'}
                    className="flex-1 rounded-xl border-2 outline-none focus:border-opacity-100 transition"
                    style={{ 
                      border: '1px solid #e5e7eb',
                      borderRadius: '20px',
                      padding: isMobile ? '12px 16px' : '8px 12px',
                      outline: 'none',
                      flex: 1,
                      fontSize: isMobile ? '16px' : '13px',
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    disabled={loading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  {config.audioInput && (
                    <button 
                      type="button" 
                      onClick={() => setIsRecording((r) => !r)} 
                      className="rounded-xl transition active:scale-95" 
                      style={{ 
                        backgroundColor: isRecording ? '#ef4444' : headerColor, 
                        color: foregroundColor,
                        padding: isMobile ? '12px' : '8px',
                        minWidth: isMobile ? '48px' : '32px',
                        minHeight: isMobile ? '48px' : '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                      }} 
                      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                      <Mic size={isMobile ? 20 : 16} />
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={loading || !inputValue.trim()} 
                    className="rounded-xl transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                    style={{ 
                      backgroundColor: headerColor, 
                      color: foregroundColor,
                      width: isMobile ? '48px' : '32px',
                      height: isMobile ? '48px' : '32px',
                      minWidth: isMobile ? '48px' : '32px',
                      minHeight: isMobile ? '48px' : '32px',
                      border: 'none',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      marginLeft: '6px',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }} 
                    aria-label="Send message"
                  >
                    <Send size={isMobile ? 20 : 16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .animate-bounce { animation: bounce 1s infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0% { opacity: 0.1; }
          20% { opacity: 1; }
          100% { opacity: 0.1; }
        }
        /* Mobile optimizations */
        @media (max-width: 767px) {
          * {
            -webkit-tap-highlight-color: transparent;
          }
          button, input, textarea {
            -webkit-appearance: none;
            -webkit-tap-highlight-color: transparent;
          }
        }
        /* Prevent zoom on input focus on iOS */
        @media screen and (max-width: 767px) {
          input[type="text"],
          input[type="email"],
          textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </>
  )
}

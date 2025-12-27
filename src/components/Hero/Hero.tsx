import { useSpring, animated, useTrail, config } from '@react-spring/web'
import { Button } from '../Button'
import TransparentLogo from '../../assets/images/transparent-logo.png'

import DashCardsBg from '../../assets/images/groupofdash.png'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

// import { Text } from '../Text'

const stats = [
  { value: '1k+', label: 'Happy Users' },
  { value: '10+', label: 'Partners' },
  { value: '2.6k+', label: 'Gift Cards Sent' },
]

export default function Hero() {
  const navigate = useNavigate()

  // Badge animation
  const badgeSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    delay: 200,
    config: config.gentle,
  })

  // Main heading animation
  const headingSpring = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    delay: 400,
    config: config.slow,
  })

  // Subtitle animation
  const subtitleSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 600,
    config: config.gentle,
  })

  // Stats trail animation
  const [statsTrail] = useTrail(stats.length, () => ({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay: 800,
    config: config.gentle,
  }))

  // Buttons animation
  const buttonsSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 1000,
    config: config.gentle,
  })

  // Background image animation
  const imageSpring = useSpring({
    from: { opacity: 0, scale: 0.9, x: 50 },
    to: { opacity: 1, scale: 1, x: 0 },
    delay: 300,
    config: config.slow,
  })

  // Transparent logo floating animation
  const logoSpring = useSpring({
    from: { opacity: 0.1, y: 0 },
    to: async (next) => {
      while (true) {
        await next({ opacity: 0.2, y: -10 })
        await next({ opacity: 0.1, y: 0 })
      }
    },
    config: { duration: 3000 },
  })

  return (
    <header className="bg-primary-500 min-h-[calc(100vh-80px)] flex pt-[80px] overflow-hidden">
      <section className="flex justify-between items-center wrapper">
        <div className="text-white py-10 relative flex flex-col gap-10">
          <animated.img
            src={TransparentLogo}
            alt="Transparent Logo"
            className="absolute top-10 z-10"
            style={{
              opacity: logoSpring.opacity,
              transform: logoSpring.y.to((y) => `translateY(${y}px)`),
            }}
          />
          <div className="flex flex-col gap-5 px-4 py-10">
            <animated.p
              style={badgeSpring}
              className="w-fit text-sm font-medium text-white bg-[#ffffff26] border border-white/20 py-2 px-5 rounded-[50px]"
            >
              🎁 Ghana's Leading Digital Gifting Platform
            </animated.p>
            <div className="max-w-[636px] w-full flex flex-col gap-12">
              <animated.p
                style={headingSpring}
                className="text-[64px] font-bold uppercase -tracking-[3%] leading-[72px]"
              >
                Gift Cards for the people that matter most in your life
              </animated.p>
              <animated.p
                style={subtitleSpring}
                className="text-[28px] font-light leading-[39px] max-w-[548px] w-full"
              >
                Welcome to DashQard!{' '}
                <span className="text-yellow-500 font-bold">Create, Connect. Celebrate.</span>
              </animated.p>
              <section className="flex gap-8">
                {statsTrail.map((style, index) => (
                  <animated.div key={index} style={style} className="flex flex-col gap-1">
                    <p className="text-[32px] font-bold leading-[32px] text-yellow-500">
                      {stats[index].value}
                    </p>
                    <p className="text-sm font-light">{stats[index].label}</p>
                  </animated.div>
                ))}
              </section>
              <animated.div style={buttonsSpring} className="flex gap-4">
                <Button
                  className="rounded-4xl! max-w-[220px] w-full"
                  icon="mdi:arrow-right-thin"
                  iconPosition="right"
                  iconProps={{ className: 'size-5 text-primary-500' }}
                >
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                  className="rounded-4xl! max-w-[220px] w-full"
                >
                  Get a Card
                </Button>
              </animated.div>
            </div>
          </div>
        </div>
        <animated.div
          style={{
            opacity: imageSpring.opacity,
            transform:
              imageSpring.scale.to((s) => `scale(${s})`) +
              ' ' +
              imageSpring.x.to((x) => `translateX(${x}px)`),
          }}
        >
          <img src={DashCardsBg} alt="DashCardsBg" />
        </animated.div>
      </section>
    </header>
  )
}

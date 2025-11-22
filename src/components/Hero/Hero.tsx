import { Button } from '../Button'
import TransparentLogo from '../../assets/images/transparent-logo.png'

import DashCardsBg from '../../assets/images/groupofdash.png'

// import { Text } from '../Text'

export default function Hero() {
  return (
    <header className="bg-primary-500 min-h-[calc(100vh-80px)] flex pt-[80px]">
      <section className="flex justify-between items-center wrapper">
        <div className="text-white py-10 relative flex flex-col gap-10">
          <img
            src={TransparentLogo}
            alt="Transparent Logo"
            className="absolute top-10 z-10 opacity-20"
          />
          <div className="flex flex-col gap-5 px-4 py-10">
            <p className="w-fit text-sm font-medium text-white bg-[#ffffff26] border border-white/20 py-2 px-5 rounded-[50px]">
              🎁 Ghana's Leading Digital Gifting Platform
            </p>
            <div className="max-w-[636px] w-full flex flex-col gap-12">
              <p className="text-[64px] font-bold uppercase -tracking-[3%] leading-[72px]">
                Gift Cards for the people that matter most in your life
              </p>
              <p className="text-[28px] font-light leading-[39px] max-w-[548px] w-full">
                Welcome to DashQard!{' '}
                <span className="text-yellow-500 font-bold">Create, Connect. Celebrate.</span>
              </p>
              <section className="flex gap-8">
                <div className="flex flex-col gap-1">
                  <p className="text-[32px] font-bold leading-[32px] text-yellow-500">1k+</p>
                  <p className="text-sm font-light">Happy Users</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[32px] font-bold leading-[32px] text-yellow-500">10+</p>
                  <p className="text-sm font-light">Partners</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[32px] font-bold leading-[32px] text-yellow-500">2.6k+</p>
                  <p className="text-sm font-light">Gift Cards Sent</p>
                </div>
              </section>
              <div className="flex gap-4">
                <Button
                  className="!rounded-4xl max-w-[220px] w-full"
                  icon="mdi:arrow-right-thin"
                  iconPosition="right"
                  iconProps={{ className: 'size-5 text-primary-500' }}
                >
                  Get Started
                </Button>
                <Button className="!rounded-4xl max-w-[220px] w-full">Get a Card</Button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <img src={DashCardsBg} alt="DashCardsBg" />
        </div>
      </section>
    </header>
  )
}

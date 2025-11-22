import LoaderGif from '@/assets/gifs/loader.gif'
export const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <img src={LoaderGif} alt="Loading..." className="w-20 h-auto" />
    </div>
  )
}

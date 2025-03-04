import Footer from "../components/Footer"
import Navbar from "../components/navbar"

const AboutDev = () => {
  return (
    <div className="w-full h-full flex flex-col items-center gap-5">
      <Navbar />
      <div className=" w-full mt-7 h-full items-center flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-wide">About Developer</h2>
        <div className="w-1/2 h-full p-2 rounded-md tracking-wide text-lg text-gray-700">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cum hic dolore assumenda, quia est tenetur unde excepturi expedita rem asperiores voluptate corrupti eligendi eaque voluptatum suscipit error minima sapiente saepe sed accusamus. Molestias doloremque, rem obcaecati veniam delectus cum. Dolorum aut sit tenetur voluptatibus quae ipsum sequi magnam fugiat iusto!

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AboutDev

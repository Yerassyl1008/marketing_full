import Image from "next/image";
import Link from "next/link";

export default function Confidentel() {
  return (
    <section className="relative mt-6 pb-12 pt-2 md:pb-16 md:pt-4">
      <div className="w-full pt-6 md:max-w-[980px] md:pt-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
          <span>⌂</span>
          <span>›</span>
          <span>Политика конфиденциальности</span>
          <span>›</span>
          <span className="font-semibold text-zinc-700">SMM</span>
        </div>

        <h1 className="mb-3 text-3xl font-extrabold leading-[1.15] text-zinc-900 sm:text-4xl md:text-5xl">
          <span className="inline-block rounded-full bg-[#f5d58d] px-4 py-1">
          Политика 
          </span>
          <br />{" "}
          конфиденциальности
         
        </h1>

        <p className="mb-6 max-w-[640px] text-sm leading-6 text-zinc-600 md:text-lg md:leading-8">
          Мы серьёзно относимся к защите ваших данных. В этом документе описано, как мы собираем, используем и храним вашу персональную информацию.
        </p>



        <div className="flex flex-row gap-6 items-center ">
          <p className="text-sm leading-6 text-zinc-600 md:text-lg md:leading-8">Версия  2.1</p>
          <p className="text-sm leading-6 text-zinc-600 md:text-lg md:leading-8">Дата обновления  01 марта 2025</p>
        </div>
      </div>

        <div className="mt-12 flex items-center gap-2 md:mt-16">
          <Link href="#" aria-label="Instagram">
            <Image src="/svg/Instagram_black.svg" alt="Instagram" width={26} height={26} />
          </Link>
          <Link href="#" aria-label="Telegram">
            <Image src="/svg/Telegram_black.svg" alt="Telegram" width={26} height={26} />
          </Link>
          <Link href="#" aria-label="Viber">
            <Image src="/svg/Viber_black.svg" alt="Viber" width={26} height={26} />
          </Link>
        </div>
    </section>
  );
}
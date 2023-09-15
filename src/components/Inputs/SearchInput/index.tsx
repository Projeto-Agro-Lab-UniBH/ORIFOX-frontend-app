import DotsLoad from "../../Load/DotsLoad";
import SearchPatientResultItem from "../../Items/SearchPatientResultItem";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";

type Patient = {
  id: string;
  profile_photo: string;
  name: string;
  specie: string;
  race: string;
};

const SearchInput = ({
  value,
  setValue,
  isLoading,
  data,
  onChange,
  onClick
}: {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  data: Patient[] | undefined;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
}) => {
  const router = useRouter();
  const [isListOpen, setIsListOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Fecha a lista quando o usuário clica fora dela
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        listRef.current &&
        inputRef.current &&
        !listRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsListOpen(false);
      }
    }

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Abre a lista quando o usuário clica no input
  const handleInputClick = () => {
    setIsListOpen(true);
  };

  const clearInput = async () => {
    setValue("");
    
    if (router.query.search != "") {
      const query = { ...router.query, ["search"]: "", page: "1" };

      await router.push({
        pathname: router.pathname,
        query,
      });

      router.reload();
    }
  }

  return (
    <div className="w-[592px] flex">
      <div className="w-[592px] flex flex-col">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon color="#808080" width={16} height={16} />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full h-10 pl-10 p-2.5 block bg-white border border-gray-200 rounded font-normal text-brand-standard-black text-sm hover:border-[#b3b3b3]"
            placeholder="Procure um paciente"
            value={value}
            onChange={onChange}
            onClick={handleInputClick}
          />
          {value !== "" && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <Cross2Icon
                width={16}
                height={16}
                className="text-gray-500 hover:text-gray-600"
              />
            </button>
          )}
        </div>
        {isListOpen && (value !== "" || isLoading) && (
          <div className="w-[592px]">
            <div
              ref={listRef}
              className="w-[592px] drop-shadow-lg absolute mt-2 z-10"
            >
              <div className="w-[592px] flex flex-col bg-white border border-gray-200 rounded">
                {isLoading ? (
                  <div className="w-full h-12 px-4 py-4 flex justify-center items-center">
                    <DotsLoad />
                  </div>
                ) : (
                  <>
                    <ul className="w-full list-none">
                      {data && data.length > 0 ? (
                        data && data.length >= 3 ? (
                          data.slice(0, 3).map((data) => (
                            <li
                              key={data.id}
                              className="w-full flex items-center border-b px-4 py-4"
                            >
                              <SearchPatientResultItem
                                key={data.id}
                                id={data.id}
                                src={data.profile_photo}
                                name={data.name}
                                specie={data.specie}
                                race={data.race}
                              />
                            </li>
                          ))
                        ) : (
                          data.map((data, i) => {
                            if (i == 1) {
                              return (
                                <li
                                  key={data.id}
                                  className="w-full flex items-center px-4 py-4"
                                >
                                  <SearchPatientResultItem
                                    key={data.id}
                                    id={data.id}
                                    src={data.profile_photo}
                                    name={data.name}
                                    specie={data.specie}
                                    race={data.race}
                                  />
                                </li>
                              );
                            }
                            return (
                              <li
                                key={data.id}
                                className="w-full flex items-center border-b px-4 py-4"
                              >
                                <SearchPatientResultItem
                                  key={data.id}
                                  id={data.id}
                                  src={data.profile_photo}
                                  name={data.name}
                                  specie={data.specie}
                                  race={data.race}
                                />
                              </li>
                            );
                          })
                        )
                      ) : (
                        <li className="w-full font-normal text-brand-standard-black text-base px-4 py-4">
                          Nenhum resultado encontrado
                        </li>
                      )}
                    </ul>
                    {data && data.length >= 3 && (
                      <button
                        onClick={onClick} 
                        className="w-full h-10 font-normal text-sm">
                        Ver todos os resultados
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;

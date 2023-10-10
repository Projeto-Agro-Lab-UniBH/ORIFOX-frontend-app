import * as Avatar from "@radix-ui/react-avatar";
import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from '@radix-ui/react-scroll-area';

import { useQuery } from "react-query";
import { Dispatch, SetStateAction, useState } from "react";
import { CameraIcon, Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";

import { api } from "../../providers/Api";
import { SearchResponse } from "../../@types/ApiResponse";

import DotsLoad from "../Shared/Loads/DotsLoad";
import PatientProfileRecordModal from "../Modal/PatientProfileRecordModal";

const Search = ({ 
  value, 
  setValue,
  onChange 
}:{
  value: string; 
  setValue: Dispatch<SetStateAction<string>>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data } = useQuery<SearchResponse[]>(
    ["searchByName", value],
    async () => {
      setIsLoading(true);
      const response = await api.get<SearchResponse[]>(
        `/patient/search/by/name?search=${value || ""}`
      );
      setIsLoading(false);
      return response.data;
    },
    {
      enabled: value !== "", // Ativa a busca assim que algo for digitado
      refetchOnReconnect: false,
    }
  )

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger className="w-[592px] border border-slate-300 rounded-lg p-2.5 gap-2 flex items-center hover:hover:border-slate-400 hover:bg-slate-200/20 focus:outline-none">
        <MagnifyingGlassIcon color="#94a3b8" width={16} height={16} />
        <span className="text-sm text-slate-400">Pesquisar um paciente</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60 inset-0 fixed z-10" />
        <Dialog.Content className="w-[592px] rounded-lg border-none fixed overflow-hidden top-12 left-1/2 -translate-x-1/2 z-10">
          <div className="w-full flex">
            <div className="w-full flex flex-col">
              <div className="w-full relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon color="#94a3b8" width={16} height={16} />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 p-2.5 block bg-white border-b border-slate-200 rounded-t font-normal text-shark-950 text-sm placeholder:text-slate-400 focus:outline-none"
                  placeholder="Pesquisar um paciente"
                  value={value}
                  onChange={onChange}
                />
                {value !== "" && (
                  <button
                    type="button"
                    onClick={() => setValue("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <Cross2Icon
                      width={16}
                      height={16}
                      className="text-slate-500 hover:text-slate-600"
                    />
                  </button>
                )}
              </div>
              <ScrollArea.Root className="w-full max-h-[488px] bg-white overflow-hidden">
                <ScrollArea.Viewport className="w-full h-full">
                  {(value !== "" || isLoading) &&
                    (isLoading ? (
                      <div className="w-full h-12 px-4 py-4 flex justify-center items-center">
                        <DotsLoad />
                      </div>
                    ) : (
                      <ul
                        role="list"
                        className="w-full divide-y divide-slate-200"
                      >
                        {data && data.length > 0 ? (
                          data.map((data) => (
                            <li
                              key={data.id}
                              className="w-full flex items-center px-4 py-4"
                            >
                              <ResultContent
                                id={data.id}
                                name={data.name}
                                src={data.profile_photo}
                                specie={data.specie}
                                race={data.race}
                              />
                            </li>
                          ))
                        ) : (
                          <li className="w-full font-normal text-slate-700 text-base px-4 py-4">
                            Nenhum resultado encontrado
                          </li>
                        )}
                      </ul>
                    ))}
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none bg-slate-100 transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-1 hover:bg-slate-200 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-1"
                  orientation="vertical"
                >
                  <ScrollArea.Thumb className="flex-1 bg-[#64748b] hover:bg-[#334155] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ResultContent = ({
  id,
  src,
  name,
  race,
  specie,
}: {
  id: string;
  src?: string;
  name: string;
  specie?: string;
  race?: string;
}) => {
  return (
    <PatientProfileRecordModal patientId={id}>
      <div className="w-full flex flex-row items-center gap-4">
        <div className="w-12 h-12">
          <Avatar.Root className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden">
            <Avatar.Image src={src} className="w-full h-full object-cover" />
            <Avatar.Fallback
              className="w-12 h-12 border border-gray-200 flex items-center justify-center rounded-full overflow-hidden"
              delayMs={600}
            >
              <CameraIcon color="#e5e7eb" width={14} height={14} />
            </Avatar.Fallback>
          </Avatar.Root>
        </div>
        <div className="w-full flex flex-col">
          <span className="max-w-[502.4px] flex whitespace-nowrap overflow-hidden text-ellipsis text-base font-semibold text-shark-950">
            {name}
          </span>
          {!specie && race != null ? undefined : (
            <span className="max-w-[502.4px] flex whitespace-nowrap overflow-hidden text-ellipsis text-base font-light text-shark-950">
              {specie}
            </span>
          )}
          {!race && specie != null ? undefined : (
            <span className="max-w-[502.4px] flex whitespace-nowrap overflow-hidden text-ellipsis text-base font-light text-shark-950">
              {race}
            </span>
          )}
        </div>
      </div>
    </PatientProfileRecordModal>
  );
};

export default Search; 
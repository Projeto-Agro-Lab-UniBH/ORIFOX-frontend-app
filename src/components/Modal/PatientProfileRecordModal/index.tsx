import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import * as Avatar from "@radix-ui/react-avatar";
import Select from "react-select";
import SpinnerLoad from "../../Load/SpinnerLoad";
import RegisterPatientReportModal from "../RegisterPatientReportModal";
import ReportItem from "../../Items/ReportItem";
import RegisterPatientExamModal from "../RegisterPatientExamModal";
import ExamItem from "../../Items/ExamItem";
import AddAttachmentModal from "../AddAttachmentModal";
import VerticalScrollbar from "../../Scrollbar/VerticalScrollbar";
import RegisterPatientHospitalization from "../RegisterPatientHospitalization";
import { api } from "../../../providers/Api";
import { queryClient } from "../../../providers/QueryClient";
import { useMutation, useQuery } from "react-query";
import { CameraIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Option } from "../../../interfaces/Option";
import { ChangeEvent, useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileCard } from "../../Cards/FileCard";
import { GetPatientEditResponse, ListExamsResponse, ListFilesResponse, ListReportsResponse, PatchPatientResponse, UploadImageResponse } from "../../../@types/ApiResponse";
import { editPatientProfileFormData, editPatientProfileFormSchema } from "../../../schemas/editPatientProfileFormSchema";

const PatientProfileRecordModal = ({ patientId, children }: { patientId: string; children: React.ReactNode; }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60 inset-0 fixed z-10" />
        <Dialog.Content className="w-[720px] rounded-lg border-none bg-white fixed overflow-hidden pt-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-full px-6 mb-6 flex items-center flex-row justify-between">
            <Dialog.Title className="font-semibold text-2xl">
              Ficha do paciente
            </Dialog.Title>
            <Dialog.Close className="w-[32px] h-[32px] flex justify-center items-center">
              <Cross1Icon width={24} height={24} />
            </Dialog.Close>
          </div>
          <Tabs.Root defaultValue="profile">
            <div className="w-full">
              <Tabs.List className="w-full h-10 pl-6 flex flex-wrap -mb-px text-sm font-medium text-center border-b border-gray-200">
                <Tabs.Trigger
                  value="profile"
                  className="inline-block px-[12px] pt-[6px] pb-3 rounded-t-lg border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-shark-950 data-[state=active]:border-b-shark-950"
                >
                  Perfil
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="attachments"
                  className="inline-block px-[12px] pt-[6px] pb-3 rounded-t-lg border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-shark-950 data-[state=active]:border-b-shark-950"
                >
                  Arquivos
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="exams"
                  className="inline-block px-[12px] pt-[6px] pb-3 rounded-t-lg border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-shark-950 data-[state=active]:border-b-shark-950"
                >
                  Exames
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="hospitalizations"
                  className="inline-block px-[12px] pt-[6px] pb-3 rounded-t-lg border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-shark-950 data-[state=active]:border-b-shark-950"
                >
                  Internações
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="reports"
                  className="inline-block px-[12px] pt-[6px] pb-3 rounded-t-lg border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-shark-950 data-[state=active]:border-b-shark-950"
                >
                  Relatórios
                </Tabs.Trigger>
              </Tabs.List>
              <TabContentProfile 
                isOpen={open} 
                patientId={patientId} 
              />
              <TabContentAttachment
                isOpen={open}
                patientId={patientId}
              />
              <TabContentExam 
                isOpen={open} 
                patientId={patientId} 
              />
              <TabContentHospitalizations 
                isOpen={open} 
                patientId={patientId} 
              />
              <TabContentReports 
                isOpen={open} 
                patientId={patientId} 
              />
            </div>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const TabContentProfile = ({ patientId, isOpen }: { patientId: string; isOpen: boolean; }) => {
  const { reset, register, watch, handleSubmit, control, formState: { errors },
  } = useForm<editPatientProfileFormData>({
    resolver: zodResolver(editPatientProfileFormSchema),
  });

  const [callRequest, setCallRequest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fetchedImage, setFetchedImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);

  const { field: selectPhysicalShape } = useController({ name: "physical_shape", control });
  const { value: selectPhysicalShapeValue, onChange: selectPhysicalShapeOnChange, ...restSelectPhysicalShape } = selectPhysicalShape;
  
  const { field: selectGender } = useController({ name: "gender", control });
  const { value: selectGenderValue, onChange: selectGenderOnChange, ...restSelectGender } = selectGender;
  
  const genderOptions: Option[] = [
    { label: "Macho", value: "Macho" },
    { label: "Fêmea", value: "Fêmea" },
  ];
  
  const physicalShapeOptions: Option[] = [
    { label: "Grande porte", value: "Grande porte" },
    { label: "Médio porte", value: "Médio porte" },
    { label: "Pequeno porte", value: "Pequeno porte" },
  ];

  useEffect(() => {
    if (isOpen != true) {
      setCallRequest(false);
      setPreviewImage(null);
      setPhoto(null);
      reset();
    } else {
      setCallRequest(true);
    }
  }, [isOpen, setPhoto, setCallRequest, reset]);

  useEffect(() => {
    if (fetchedImage) {
      setPhoto(fetchedImage);
    }
    if (previewImage) {
      setPhoto(previewImage);
    }
  }, [photo, setPhoto, fetchedImage, previewImage]);

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files?.[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  useQuery({
    queryKey: ["get-patient-by-id"],
    queryFn: async () => {
      setIsLoading(true);
      await api.get<GetPatientEditResponse>(`/patient/${patientId}`)
        .then((res) => {
          reset(res.data);
          setFetchedImage(res.data.profile_photo);
        });
      setIsLoading(false);
    },
    enabled: callRequest,
  });

  const { isLoading: isUpdating, mutate } = useMutation({
    mutationKey: ["update-patient"],
    mutationFn: async (data: editPatientProfileFormData) => {
      if (selectedImage != undefined) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        const upload = await api.post<UploadImageResponse>('uploads/image/', formData)
        
        await api.patch<PatchPatientResponse>(`/patient/${patientId}`, {
          ...data,
          profile_photo: upload.data.imageUrl,
        });
      } else {
        await api.patch<PatchPatientResponse>(`/patient/${patientId}`, {
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });

  const onSubmit = (data: editPatientProfileFormData) => {
    const request = {
      ...data,
    };
    mutate(request);
  };

  return (
    <Tabs.Content value="profile">
      {(isLoading || isUpdating) && (
        <div className="w-full h-full absolute z-20">
          <div className="w-full h-full bg-[#f9fafb8b]">
            <SpinnerLoad
              divProps={{
                className:
                  "w-full h-[488px] relative flex items-center justify-center bg-gray-500-50",
              }}
            />
          </div>
        </div>
      )}
      <VerticalScrollbar styleViewportArea="w-full h-[488px] px-6 py-6">
        <form
          className="w-full flex flex-col gap-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full flex flex-col gap-6">
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex items-center gap-4">
                <div className="w-[72px] flex items-center flex-col gap-2">
                  <div className="w-full flex items-center justify-center">
                    <span className="text-sm font-normal text-shark-950">
                      Foto
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-center">
                    <Avatar.Root className="w-16 h-16 flex items-center justify-center rounded-full overflow-hidden">
                      <Avatar.Image
                        src={photo as string | undefined}
                        className="w-full h-full object-cover"
                      />
                      <Avatar.Fallback
                        className="w-16 h-16 border border-gray-200 flex items-center justify-center rounded-full overflow-hidden"
                        delayMs={600}
                      >
                        <CameraIcon width={16} height={16} color="#e5e7eb" />
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </div>
                </div>
                <div className="w-full h-full flex">
                  <div className="w-full flex justify-center flex-col gap-1">
                    <label
                      htmlFor="patient-photo-file"
                      className="w-[156px] text-base font-normal text-blue-500 cursor-pointer"
                    >
                      Selecionar uma foto
                    </label>
                    <input
                      type="file"
                      accept=".jpg, .jpeg, .png"
                      id="patient-photo-file"
                      className="hidden"
                      onChange={handleImage}
                    />
                    <div className="w-full">
                      <div className="w-[516px] flex flex-col">
                        <p className="w-16 text-sm font-normal text-shark-950 ">
                          Dica:
                        </p>
                        <p className="w-[500px] text-gray-500 font-normal text-sm whitespace-nowrap">
                          Uma foto de perfil do paciente o ajuda a ser
                          reconhecido na plataforma.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row gap-4">
              <div className="w-[368px]">
                <div className="w-[368px] flex flex-col gap-2">
                  <div className="w-[368px] flex flex-col gap-3">
                    <label
                      htmlFor="name"
                      className="w-full text-sm font-normal text-shark-950"
                    >
                      Nome do paciente
                    </label>
                    <input
                      type="text"
                      className={`w-full h-10 px-3 py-3 text-sm text-shark-950 font-normal bg-white rounded border border-solid ${
                        errors.name
                          ? "border-red-200  hover:border-red-500"
                          : "border-gray-200 hover:border-[#b3b3b3]"
                      }`}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <span className={"text-xs font-normal text-red-500"}>
                      {errors.name.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full">
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full flex flex-col gap-3">
                    <label
                      htmlFor="specie"
                      className="w-full text-sm font-normal text-shark-950"
                    >
                      Espécie
                    </label>
                    {watch("undefined_specie") == true ? (
                      <input
                        type="text"
                        className="w-full h-10 px-3 py-3 text-gray-100 bg-gray-100 border border-gray-200 rounded cursor-not-allowed"
                        disabled
                      />
                    ) : (
                      <input
                        type="text"
                        className={`w-full h-10 px-3 py-3 text-sm text-shark-950 font-normal bg-white rounded border border-solid ${
                          errors.specie
                            ? "border-red-200  hover:border-red-500"
                            : "border-gray-200 hover:border-[#b3b3b3]"
                        }`}
                        {...register("specie")}
                      />
                    )}
                  </div>
                  {errors.specie && (
                    <span
                      className={
                        watch("undefined_specie") == false
                          ? "text-xs font-normal text-red-500"
                          : "hidden text-xs font-normal text-red-500"
                      }
                    >
                      {errors.specie.message}
                    </span>
                  )}
                  <div className="w-full flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="checkbox2"
                      {...register("undefined_specie")}
                    ></input>
                    <label
                      htmlFor="checkbox2"
                      className="text-xs font-normal text-gray-500"
                    >
                      Sem espécie definida.
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row gap-4">
              <div className="w-[368px]">
                <div className="w-[368px] flex flex-col gap-2">
                  <div className="w-[368px] flex flex-col gap-3">
                    <label
                      htmlFor="owner"
                      className="w-full text-sm font-normal text-shark-950"
                    >
                      Nome do tutor(a)
                    </label>
                    {watch("ownerless_patient") == true ? (
                      <input
                        type="text"
                        className="w-full h-10 px-3 py-3 text-gray-100 bg-gray-100 border border-gray-200 rounded cursor-not-allowed"
                        disabled
                      />
                    ) : (
                      <input
                        type="text"
                        className={`w-full h-10 px-3 py-3 text-sm text-shark-950 font-normal bg-white rounded border border-solid ${
                          errors.owner
                            ? "border-red-200  hover:border-red-500"
                            : "border-gray-200 hover:border-[#b3b3b3]"
                        }`}
                        {...register("owner")}
                      />
                    )}
                  </div>
                  {errors.owner && (
                    <span
                      className={
                        watch("ownerless_patient") == false
                          ? "text-xs font-normal text-red-500"
                          : "hidden text-xs font-normal text-red-500"
                      }
                    >
                      {errors.owner.message}
                    </span>
                  )}
                  <div className="w-full flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="checkbox3"
                      {...register("ownerless_patient")}
                    ></input>
                    <label
                      htmlFor="checkbox3"
                      className="text-xs font-normal text-gray-500"
                    >
                      Não foi identificado o tutor do paciente.
                    </label>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full flex flex-col gap-3">
                    <label
                      htmlFor="race"
                      className="w-full text-sm font-normal text-shark-950"
                    >
                      Raça
                    </label>
                    {watch("undefined_race") == true ? (
                      <input
                        type="text"
                        className="w-full h-10 px-3 py-3 text-gray-100 bg-gray-100 border border-gray-200 rounded cursor-not-allowed"
                        disabled
                      />
                    ) : (
                      <input
                        type="text"
                        className={`w-full h-10 px-3 py-3 text-sm text-shark-950 font-normal bg-white rounded border border-solid ${
                          errors.race
                            ? "border-red-200  hover:border-red-500"
                            : "border-gray-200 hover:border-[#b3b3b3]"
                        }`}
                        {...register("race")}
                      />
                    )}
                  </div>
                  {errors.race && (
                    <span
                      className={
                        watch("undefined_race") == false
                          ? "text-xs font-normal text-red-500"
                          : "hidden text-xs font-normal text-red-500"
                      }
                    >
                      {errors.race.message}
                    </span>
                  )}
                  <div className="w-full flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="checkbox4"
                      {...register("undefined_race")}
                    ></input>
                    <label
                      htmlFor="checkbox4"
                      className="text-xs font-normal text-gray-500"
                    >
                      Sem raça definida.
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row gap-4">
              <div className="w-44">
                <div className="w-44 flex flex-col gap-6">
                  <div className="w-full flex flex-col gap-3">
                    <label
                      htmlFor="physical_shape"
                      className="w-full text-sm font-normal text-shark-950"
                    >
                      Porte físico
                    </label>
                    <Select
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          width: "100%",
                          height: 40,
                          borderColor: state.isFocused ? "#e2e8f0" : "#e2e8f0",
                          borderRadius: 4,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          fontFamily: "Inter",
                          fontWeight: 400,
                          fontSize: "0.875rem",
                          lineHeight: "1.25rem",
                        }),
                      }}
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary75: "#cbd5e1",
                          primary50: "##e2e8f0",
                          primary25: "#f8fafc",
                          primary: "#212529",
                        },
                      })}
                      placeholder="Selecione"
                      isSearchable={false}
                      options={physicalShapeOptions}
                      value={
                        selectPhysicalShapeValue
                          ? physicalShapeOptions.find(
                              (x) => x.value === selectPhysicalShapeValue
                            )
                          : selectPhysicalShapeValue
                      }
                      onChange={(option) =>
                        selectPhysicalShapeOnChange(
                          option ? option.value : option
                        )
                      }
                      {...restSelectPhysicalShape}
                    />
                  </div>
                </div>
              </div>
              <div className="w-44">
                <div className="w-44 flex flex-col gap-6">
                  <div className="w-full flex flex-col gap-3">
                    <label
                      htmlFor="weight"
                      className="w-full text-sm font-normal text-shark-950"
                    >
                      Peso
                    </label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 py-3 text-sm text-shark-950 font-normal border border-gray-200 rounded bg-white hover:boder hover:border-[#b3b3b3]"
                      {...register("weight")}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="w-full flex flex-col gap-6">
                  <div className="w-full flex flex-col gap-3">
                    <label
                      htmlFor="gender"
                      className="w-full text-sm font-normal text-shark-950"
                    >
                      Gênero
                    </label>
                    <Select
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          width: "100%",
                          height: 40,
                          borderColor: state.isFocused ? "#e2e8f0" : "#e2e8f0",
                          borderRadius: 4,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          fontFamily: "Inter",
                          fontWeight: 400,
                          fontSize: "0.875rem",
                          lineHeight: "1.25rem",
                        }),
                      }}
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary75: "#cbd5e1",
                          primary50: "##e2e8f0",
                          primary25: "#f8fafc",
                          primary: "#212529",
                        },
                      })}
                      placeholder="Selecione o sexo do paciente"
                      isSearchable={false}
                      options={genderOptions}
                      onChange={(option) =>
                        selectGenderOnChange(option ? option.value : option)
                      }
                      value={
                        selectGenderValue
                          ? genderOptions.find(
                              (x) => x.value === selectGenderValue
                            )
                          : selectGenderValue
                      }
                      {...restSelectGender}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-10 flex items-center justify-end">
            <button
              type="submit"
              className="w-[152px] h-10 border border-gray-200 rounded font-medium text-base text-shark-950 bg-white hover:border-none hover:text-neutral-50 hover:bg-blue-500"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </VerticalScrollbar>
    </Tabs.Content>
  );
};

const TabContentAttachment = ({ patientId, isOpen }: { patientId: string; isOpen: boolean; }) => {
  const [callRequest, setCallRequest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ["get-file-by-patientId"],
    queryFn: async () => {
      setIsLoading(true)
      const response = await api.get<ListFilesResponse[]>(`/files/${patientId}/files`)
      setIsLoading(false)
      return response.data
    },
    enabled: callRequest,
  })

  useEffect(() => {
    if (isOpen != true) {
      setCallRequest(false);
    } else {
      setCallRequest(true);
    }
  }, [isOpen, setCallRequest]);
  
  return (
    <Tabs.Content value="attachments">
      {isLoading && (
        <div className="w-full h-full absolute z-20">
          <div className="w-full h-full bg-[#f9fafb8b]">
            <SpinnerLoad
              divProps={{
                className:
                  "w-full h-[488px] relative flex items-center justify-center bg-gray-500-50",
              }}
            />
          </div>
        </div>
      )}
      <VerticalScrollbar
        styleViewportArea="w-full h-[488px] px-6 py-6"
      >
        <div className="w-full flex flex-col items-center gap-6">
          <div className="w-full flex justify-start">
            <AddAttachmentModal patientId={patientId} />
          </div>
          <div className="w-full grid grid-cols-3 gap-[28px]">
            {data &&
              data?.map((data) => (
                <FileCard
                  key={data.id}
                  id={data.id}
                  filename={data.filename}
                  fileUrl={data.fileUrl}
                  fileSize={data.fileSize}
                />
              ))}
          </div>
        </div>
      </VerticalScrollbar>
    </Tabs.Content>
  )
}

const TabContentExam = ({ patientId, isOpen }: { patientId: string; isOpen: boolean; }) => {
  const [callRequest, setCallRequest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ["list-all-exams"],
    queryFn: async () => {
      setIsLoading(true)
      const response = await api.get<ListExamsResponse[]>(`/exams/${patientId}/exams`)
      setIsLoading(false)
      return response.data 
    },
    enabled: callRequest,
  });

  useEffect(() => {
    if (isOpen != true) {
      setCallRequest(false);
    } else {
      setCallRequest(true);
    }
  }, [isOpen, setCallRequest]);
  
  return (
    <Tabs.Content value="exams">
      {isLoading && (
        <div className="w-full h-full absolute z-20">
          <div className="w-full h-full bg-[#f9fafb8b]">
            <SpinnerLoad
              divProps={{
                className:
                  "w-full h-[400px] relative flex items-center justify-center bg-gray-500-50",
              }}
            />
          </div>
        </div>
      )}
      <div className="w-full flex flex-col pb-6 items-center gap-6">
        <VerticalScrollbar
          styleViewportArea="w-full h-[400px] px-6 py-6"
        >
          <div className="w-full flex flex-col items-center gap-6">
            {data &&
              data.map((data) => (
                <ExamItem
                  key={data.id}
                  id={data.id}
                  patientId={data.patientId}
                  date={data.date}
                  author={data.author}
                  type_of_exam={data.type_of_exam}
                  annotations={data.annotations}
                  filename={data.filename}
                  fileUrl={data.fileUrl}
                  fileSize={data.fileSize}
                  createdAt={data.createdAt}
                  updatedAt={data.updatedAt}
                />
              ))}
          </div>
        </VerticalScrollbar>
        <div className="w-full h-10 px-6 flex justify-end">
          <RegisterPatientExamModal patientId={patientId} />
        </div>
      </div>
    </Tabs.Content>
  )
}

const TabContentHospitalizations = ({ patientId, isOpen }: { patientId: string; isOpen: boolean; }) => {
  const [callRequest, setCallRequest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Tabs.Content value="hospitalizations">
      {isLoading && (
        <div className="w-full h-full absolute z-20">
          <div className="w-full h-full bg-[#f9fafb8b]">
            <SpinnerLoad
              divProps={{
                className:
                  "w-full h-[400px] relative flex items-center justify-center bg-gray-500-50",
              }}
            />
          </div>
        </div>
      )}
      <div className="w-full flex flex-col pb-6 items-center gap-6">
        <VerticalScrollbar
          styleViewportArea="w-full h-[400px] px-6 py-6"
        >
          <div className="w-full flex flex-col items-center gap-6">

          </div>
        </VerticalScrollbar>
        <div className="w-full h-10 px-6 flex justify-end">
          <RegisterPatientHospitalization patientId={patientId} />
        </div>
      </div>
    </Tabs.Content>
  )
}

const TabContentReports = ({ patientId, isOpen }: { patientId: string; isOpen: boolean; }) => {
  const [callRequest, setCallRequest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { data } = useQuery({
		queryKey: ['list-all-reports'],
		queryFn: async () => {
			setIsLoading(true)
      const response = await api.get<ListReportsResponse[]>(`/reports/${patientId}/reports`);
      setIsLoading(false);
			return response.data;
		},
		enabled: callRequest,
	});

  useEffect(() => {
    if (isOpen != true) {
      setCallRequest(false);
    } else {
      setCallRequest(true);
    }
  }, [isOpen, setCallRequest]);

  return (
    <Tabs.Content value="reports">
      {isLoading && (
        <div className="w-full h-full absolute z-20">
          <div className="w-full h-full bg-[#f9fafb8b]">
            <SpinnerLoad
              divProps={{
                className:
                  "w-full h-[400px] relative flex items-center justify-center bg-gray-500-50",
              }}
            />
          </div>
        </div>
      )}
      <div className="w-full flex flex-col pb-6 items-center gap-6">
        <VerticalScrollbar
          styleViewportArea="w-full h-[400px] px-6 py-6"
        >
          <div className="w-full flex flex-col items-center gap-6">
            {data &&
              data?.map((data) => (
                <ReportItem
                  key={data.id}
                  id={data.id}
                  patientId={data.patientId}
                  shift={data.shift}
                  author={data.author}
                  title={data.title}
                  report_text={data.report_text}
                  filename={data.filename}
                  fileUrl={data.fileUrl}
                  createdAt={data.createdAt}
                  updatedAt={data.updatedAt}
                />
              ))}
          </div>
        </VerticalScrollbar>
        <div className="w-full h-10 px-6 flex justify-end">
          <RegisterPatientReportModal patientId={patientId} />
        </div>
      </div>
    </Tabs.Content>
  )
};

export default PatientProfileRecordModal;
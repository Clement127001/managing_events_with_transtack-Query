import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../Util/http.js";

import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const { id } = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 10000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({ queryKey: ["events", id] });
  //     const previousEvent = queryClient.getQueryData(["events", id]);
  //     queryClient.setQueryData(["events", id], newEvent);

  //     return previousEvent;
  //   },
  //   onError: (data, context, error) => {
  //     queryClient.setQueryData(["events", id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["events", id],
  //     });
  //   },
  // });
  function handleSubmit(formData) {
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError)
    content = (
      <>
        <ErrorBlock
          title="Fetching Failed"
          message={
            error.info?.message ||
            "can't able to fetch the data, please try after some time"
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );

  if (data)
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state == "submitting" ? (
          <p>submtting data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );

  return <Modal onClose={handleClose}>{content}</Modal>;
}

//loader for fetching the data for the rendering of the web page

export const loader = ({ params }) => {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const updatedData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedData });
  await queryClient.invalidateQueries(["events"]);

  return redirect("../");
};

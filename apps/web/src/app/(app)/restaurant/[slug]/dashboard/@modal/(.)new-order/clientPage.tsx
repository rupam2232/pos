import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@repo/ui/components/dialog";

const ClientPage = () => {
  return (
    <Dialog  open={true}>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new order.
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maxime, error delectus ad exercitationem, veritatis quam cum in quod assumenda fuga adipisci facere quasi incidunt quisquam unde sequi ut explicabo. Commodi eius quo cupiditate odio ratione? Unde obcaecati dicta amet, qui, consequatur repudiandae et delectus nostrum alias, assumenda nihil ullam aliquam! Voluptates similique non consequuntur commodi ad necessitatibus obcaecati a, illum sed repellendus atque ab, explicabo reprehenderit animi tempora et cupiditate quaerat, quod praesentium minus. Ipsum, sint voluptatem repellendus fugit ut assumenda ratione suscipit quae cupiditate! Vel saepe dignissimos consequatur a inventore mollitia possimus cupiditate quis perferendis, nam odit, quae soluta magnam accusantium libero dolore consequuntur sunt veniam! Temporibus nam ut tempora eaque dolorum accusantium id similique ipsam dolore quasi, commodi alias at, adipisci beatae quisquam, eveniet in culpa vero molestiae enim dolorem optio repudiandae quae? Excepturi suscipit numquam perferendis nulla praesentium cupiditate id voluptates nesciunt? Nulla quo sapiente temporibus natus! Fugiat consequuntur et sequi temporibus ad, repellat, magnam rem velit debitis amet placeat ratione vitae voluptate minima quo officia dicta, nisi reprehenderit esse? Sint ullam nulla sunt necessitatibus quas, ipsa sed quae doloremque consectetur cupiditate reprehenderit officia culpa maxime nisi excepturi omnis? Ab, iure, dicta et nesciunt molestiae fugiat animi, ipsa iste repellat rerum numquam repellendus consectetur? Voluptatibus quam consequatur dolores molestias pariatur, veritatis voluptates quo, soluta provident sint dolore iusto obcaecati. Ab officia nostrum incidunt repudiandae reiciendis nemo et id harum fuga omnis.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <DialogClose>Submit</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ClientPage
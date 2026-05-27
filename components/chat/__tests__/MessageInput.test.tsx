import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "../MessageInput";

describe("MessageInput", () => {
  it("envía el mensaje escrito por el usuario", async () => {
    const user = userEvent.setup();
    const onSendMessage = jest.fn();

    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByLabelText("Escribe tu mensaje");
    await user.type(input, "Necesito ayuda para organizarme");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(onSendMessage).toHaveBeenCalledWith("Necesito ayuda para organizarme");
    expect(input).toHaveValue("");
  });
});

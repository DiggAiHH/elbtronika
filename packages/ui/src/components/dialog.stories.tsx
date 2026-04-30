import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta: Meta = {
  title: "Overlay & Feedback/Dialog",
  parameters: { layout: "centered" },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">Werk kaufen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kauf bestätigen</DialogTitle>
          <DialogDescription>
            Du kaufst „Neon Decay #003" von DJ Parallax für 320 €. Diese Aktion kann nicht
            rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">Abbrechen</Button>
          <Button variant="primary">Jetzt kaufen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Destructive: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Konto löschen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konto unwiderruflich löschen?</DialogTitle>
          <DialogDescription>
            Alle Daten, Werke und Transaktionen werden dauerhaft gelöscht. Diese Aktion kann nicht
            rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">Abbrechen</Button>
          <Button variant="destructive">Endgültig löschen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

import { SlotDto } from "./slot.dto";

export class SlotDtosResponse {
    slots: SlotDto[];
    additionalNotes?: string;

    static Map(slots: SlotDto[], note: string | undefined = undefined): SlotDtosResponse {
        const res = new SlotDtosResponse();
        res.slots = slots;
        res.additionalNotes = note;
        return res;
    }
}

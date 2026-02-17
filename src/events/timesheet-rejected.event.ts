export class TimesheetRejectedEvent {
    constructor(
        public readonly timesheetId: string,
        public readonly userId: string,
        public readonly userEmail: string,
        public readonly userName: string,
        public readonly weekStartDate: Date,
        public readonly weekEndDate: Date,
        public readonly approverName: string,
        public readonly approverComments: string,
    ) {}
}

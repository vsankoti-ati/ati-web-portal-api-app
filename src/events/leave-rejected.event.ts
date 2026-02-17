export class LeaveRejectedEvent {
    constructor(
        public readonly leaveApplicationId: string,
        public readonly userId: string,
        public readonly userEmail: string,
        public readonly userName: string,
        public readonly leaveType: string,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public readonly daysRequested: number,
        public readonly approverName: string,
        public readonly approverComments: string,
    ) {}
}

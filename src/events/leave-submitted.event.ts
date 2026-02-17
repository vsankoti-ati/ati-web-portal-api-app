export class LeaveSubmittedEvent {
    constructor(
        public readonly leaveApplicationId: string,
        public readonly submitterId: string,
        public readonly submitterEmail: string,
        public readonly submitterName: string,
        public readonly leaveType: string,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public readonly daysRequested: number,
        public readonly reason: string,
        public readonly submitterGeoLocation: string,
    ) {}
}

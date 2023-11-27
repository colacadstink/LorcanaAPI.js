import {expect, test} from "@jest/globals";

export function failIfReason(reason: string) {
  if(reason) {
    fail(reason);
  }
}

export function fail(reason: string) {
  expect(`[FAIL]\n${reason}`.trim()).toBeFalsy();
}

test('failIfReason fails when given a string', () => {
  expect(() => failIfReason('reason')).toThrow();
});
test('failIfReason is fine when given an empty string', () => {
  failIfReason('');
});

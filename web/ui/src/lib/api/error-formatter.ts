import { Code, ConnectError } from '@connectrpc/connect';
import { get } from 'svelte/store';
import { _ } from 'svelte-i18n';

type ValidationError = {
	field: string;
	message: string;
	constraint?: string;
};

const parseValidationErrors = (message: string): ValidationError[] => {
	const errors: ValidationError[] = [];

	// Match pattern: "- field: message [constraint]"
	const validationPattern = /- ([^:]+): ([^[]+)(?:\[([^\]]+)\])?/g;
	let match;

	while ((match = validationPattern.exec(message)) !== null) {
		errors.push({
			field: match[1].trim(),
			message: match[2].trim(),
			constraint: match[3]?.trim()
		});
	}

	return errors;
};

const formatFieldName = (field: string): string => {
	// Convert snake_case or camelCase to Title Case
	return field
		.replace(/([A-Z])/g, ' $1')
		.replace(/_/g, ' ')
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
		.trim();
};

const getErrorTitle = (code: Code): string => {
	const t = get(_);
	switch (code) {
		case Code.Canceled:
			return t('errors.requestCanceled');
		case Code.Unknown:
			return t('errors.unknownError');
		case Code.InvalidArgument:
			return t('errors.invalidInput');
		case Code.DeadlineExceeded:
			return t('errors.requestTimeout');
		case Code.NotFound:
			return t('errors.notFound');
		case Code.AlreadyExists:
			return t('errors.alreadyExists');
		case Code.PermissionDenied:
			return t('errors.permissionDenied');
		case Code.ResourceExhausted:
			return t('errors.rateLimitExceeded');
		case Code.FailedPrecondition:
			return t('errors.actionNotAllowed');
		case Code.Aborted:
			return t('errors.requestAborted');
		case Code.OutOfRange:
			return t('errors.outOfRange');
		case Code.Unimplemented:
			return t('errors.notImplemented');
		case Code.Internal:
			return t('errors.serverError');
		case Code.Unavailable:
			return t('errors.serviceUnavailable');
		case Code.DataLoss:
			return t('errors.dataLoss');
		case Code.Unauthenticated:
			return t('errors.authRequired');
		default:
			return t('errors.error');
	}
};

const getDefaultDescription = (code: Code): string | undefined => {
	const t = get(_);
	switch (code) {
		case Code.Canceled:
			return t('errors.requestCanceledDesc');
		case Code.Unknown:
			return t('errors.unknownErrorDesc');
		case Code.DeadlineExceeded:
			return t('errors.requestTimeoutDesc');
		case Code.ResourceExhausted:
			return t('errors.rateLimitDesc');
		case Code.Internal:
			return t('errors.unexpectedDesc');
		case Code.Unavailable:
			return t('errors.serviceUnavailableDesc');
		case Code.PermissionDenied:
			return t('errors.permissionDeniedDesc');
		case Code.Unauthenticated:
			return t('errors.authRequiredDesc');
		case Code.NotFound:
			return t('errors.notFoundDesc');
		case Code.AlreadyExists:
			return t('errors.alreadyExistsDesc');
		case Code.Aborted:
			return t('errors.requestAbortedDesc');
		case Code.Unimplemented:
			return t('errors.notImplementedDesc');
		case Code.DataLoss:
			return t('errors.dataLossDesc');
		default:
			return undefined;
	}
};

export const formatConnectError = (
	error: ConnectError
): { title: string; description?: string } => {
	const t = get(_);
	const title = getErrorTitle(error.code);

	// Check if this is a validation error
	if (error.code === Code.InvalidArgument && error.rawMessage.includes('validation error:')) {
		const validationErrors = parseValidationErrors(error.rawMessage);

		if (validationErrors.length === 1) {
			// Single validation error
			const { field, message } = validationErrors[0];
			return {
				title: formatFieldName(field),
				description: message
			};
		} else if (validationErrors.length > 1) {
			// Multiple validation errors
			const description = validationErrors
				.map(({ field, message }) => `${formatFieldName(field)}: ${message}`)
				.join('\n');

			return {
				title: t('errors.validationFailed'),
				description
			};
		}
	}

	// Use rawMessage which doesn't have the [code] prefix
	let description = error.rawMessage.trim();

	// If the description is too generic, empty, or matches the title, use a better default
	if (!description || description.length < 3 || description.toLowerCase() === title.toLowerCase()) {
		description = getDefaultDescription(error.code) || '';
	}

	return {
		title,
		description: description || undefined
	};
};

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ModalVariant = 'success' | 'error' | 'info';

type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: React.ReactNode;
  variant?: ModalVariant;
  primaryAction?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
};

const variantConfig: Record<ModalVariant, { icon: any; color: string; background: string }> = {
  success: { icon: 'checkmark-circle', color: '#10b981', background: '#ecfdf5' },
  error: { icon: 'warning', color: '#dc2626', background: '#fef2f2' },
  info: { icon: 'information-circle', color: '#3b82f6', background: '#eff6ff' },
};

export default function AppModal({ visible, onClose, title, message, variant = 'info', primaryAction, secondaryAction }: AppModalProps) {
  const cfg = variantConfig[variant];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.iconBadge, { backgroundColor: cfg.background }]}>
            <Ionicons name={cfg.icon} size={28} color={cfg.color} />
          </View>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {typeof message === 'string' ? (
            <Text style={styles.message}>{message}</Text>
          ) : (
            message
          )}

          <View style={styles.actionsRow}>
            {secondaryAction && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={secondaryAction.onPress}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>{secondaryAction.label}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: cfg.color }]}
              onPress={primaryAction ? primaryAction.onPress : onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                {primaryAction ? primaryAction.label : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


